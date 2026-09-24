import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { polls, questions, options } from "./poll.schema.js";
import { responses } from "../response/response.schema.js";
import { users } from "../auth/auth.schema.js";
import { addHours } from "../../common/utils/time.js";
import { AppError } from "../../common/utils/app-error.js";
import { config } from "../../common/config/env.js";

/**
 * PollService — all poll CRUD, expiry, and publish logic.
 * No Express req/res awareness — pure business logic.
 */
export class PollService {
	constructor(db, socketService, activityService) {
		this.db = db;
		this.socket = socketService;
		this.activity = activityService;
	}

	// ── helpers ────────────────────────────────────────────

	async _getById(pollId) {
		const rows = await this.db.select().from(polls).where(eq(polls.id, pollId)).limit(1);
		return rows[0] || null;
	}

	async _getQuestionsWithOptions(pollId) {
		const questionRows = await this.db
			.select()
			.from(questions)
			.where(eq(questions.pollId, pollId))
			.orderBy(questions.sortOrder);

		const questionIds = questionRows.map((q) => q.id);
		const optionRows = questionIds.length
			? await this.db
					.select()
					.from(options)
					.where(inArray(options.questionId, questionIds))
					.orderBy(options.sortOrder)
			: [];

		const optionsByQuestion = new Map();
		for (const opt of optionRows) {
			const list = optionsByQuestion.get(opt.questionId) || [];
			list.push(opt);
			optionsByQuestion.set(opt.questionId, list);
		}
	
		return { questionRows, optionsByQuestion };
	}

	_formatPollWithQuestions(poll, questionRows, optionsByQuestion) {
		return {
			id: poll.id,
			title: poll.title,
			description: poll.description,
			status: poll.status,
			mode: poll.mode,
			createdAt: poll.createdAt,
			expiresAt: poll.expiresAt,
			questions: questionRows.map((q) => ({
				id: q.id,
				text: q.text,
				mandatory: q.mandatory,
				options: (optionsByQuestion.get(q.id) || []).map((o) => o.label),
			})),
		};
	}

	// ── expiry ─────────────────────────────────────────────

	async applyExpiry(poll) {
		if (!poll || !poll.expiresAt) return poll;
		if (poll.status === "expired" || poll.status === "published") return poll;

		const now = new Date();
		if (poll.expiresAt > now) return poll;

		const updated = await this.db
			.update(polls)
			.set({ status: "expired" })
			.where(eq(polls.id, poll.id))
			.returning();

		const expired = updated[0] || { ...poll, status: "expired" };

		this.socket.emitStatusUpdate(poll.id, "expired");
		await this.activity.log(poll.userId, "expire", `Poll "${poll.title}" expired`);

		return expired;
	}

	// ── CRUD ───────────────────────────────────────────────

	async list(userId) {
		// Batch-expire all overdue polls in one query
		await this.db
			.update(polls)
			.set({ status: "expired" })
			.where(
				and(
					eq(polls.userId, userId),
					sql`${polls.status} NOT IN ('expired', 'published')`,
					sql`${polls.expiresAt} IS NOT NULL AND ${polls.expiresAt} <= now()`
				)
			);

		const pollRows = await this.db
			.select()
			.from(polls)
			.where(eq(polls.userId, userId))
			.orderBy(desc(polls.createdAt));

		const pollIds = pollRows.map((p) => p.id);
		if (pollIds.length === 0) return [];

		const [questionCounts, responseCounts] = await Promise.all([
			this.db
				.select({
					pollId: questions.pollId,
					count: sql`count(*)`.mapWith(Number),
				})
				.from(questions)
				.where(inArray(questions.pollId, pollIds))
				.groupBy(questions.pollId),
			this.db
				.select({
					pollId: responses.pollId,
					count: sql`count(*)`.mapWith(Number),
				})
				.from(responses)
				.where(inArray(responses.pollId, pollIds))
				.groupBy(responses.pollId),
		]);

		const qMap = new Map(questionCounts.map((r) => [r.pollId, r.count]));
		const rMap = new Map(responseCounts.map((r) => [r.pollId, r.count]));

		return pollRows.map((p) => ({
			id: p.id,
			title: p.title,
			description: p.description,
			status: p.status,
			mode: p.mode,
			questions: qMap.get(p.id) || 0,
			responses: rMap.get(p.id) || 0,
			maxResponses: p.maxResponses,
			createdAt: p.createdAt,
			expiresAt: p.expiresAt,
		}));
	}

	async getById(pollId) {
		const poll = await this._getById(pollId);
		if (!poll) return null;

		const normalized = await this.applyExpiry(poll);
		const { questionRows, optionsByQuestion } = await this._getQuestionsWithOptions(pollId);
		return this._formatPollWithQuestions(normalized, questionRows, optionsByQuestion);
	}

	async getPublic(pollId) {
		return this.getById(pollId);
	}

	async create(userId, data) {
		// ── enforce plan limits ──
		const userRow = await this.db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
		const email = (userRow[0]?.email || "").toLowerCase();
		const isUnlimited = config.unlimitedEmails.has(email);

		if (!isUnlimited) {
			const modeCol = data.mode === "anonymous" ? "anonymous" : "authenticated";
			const limit = modeCol === "anonymous" ? config.planLimits.anon : config.planLimits.auth;

			const usedRow = await this.db
				.select({ count: sql`count(*)`.mapWith(Number) })
				.from(polls)
				.where(and(
					eq(polls.userId, userId),
					eq(polls.mode, modeCol),
					eq(polls.status, "active"),
				));
			const used = usedRow[0]?.count || 0;

			if (used >= limit) {
				throw new AppError(
					`You have reached your ${modeCol} poll limit (${limit}). Upgrade your plan for more.`,
					403,
					"LIMIT_REACHED"
				);
			}
		}

		const now = new Date();
		const expiresAt = data.expiresIn ? addHours(now, data.expiresIn) : null;

		const result = await this.db.transaction(async (tx) => {
			const inserted = await tx
				.insert(polls)
				.values({
					userId,
					title: data.title,
					description: data.description ?? null,
					mode: data.mode,
					status: "active",
					maxResponses: data.maxResponses ?? 500,
					expiresAt,
				})
				.returning();

			const poll = inserted[0];

			const questionValues = data.questions.map((q, i) => ({
				pollId: poll.id,
				text: q.text,
				mandatory: q.mandatory ?? true,
				sortOrder: i,
			}));

			const insertedQuestions = await tx.insert(questions).values(questionValues).returning();
			const questionIdByOrder = new Map(
				insertedQuestions.map((q) => [q.sortOrder, q.id])
			);

			const optionValues = [];
			data.questions.forEach((q, qi) => {
				const questionId = questionIdByOrder.get(qi);
				q.options.forEach((label, oi) => {
					optionValues.push({ questionId, label, sortOrder: oi });
				});
			});

			if (optionValues.length > 0) {
				await tx.insert(options).values(optionValues);
			}

			await this.activity.log(userId, "create", `Created poll "${poll.title}"`, tx);

			return poll;
		});

		return {
			id: result.id,
			title: result.title,
			description: result.description,
			status: result.status,
			mode: result.mode,
			createdAt: result.createdAt,
			expiresAt: result.expiresAt,
		};
	}

	async update(poll, data) {
		const responseCountRows = await this.db
			.select({ count: sql`count(*)`.mapWith(Number) })
			.from(responses)
			.where(eq(responses.pollId, poll.id));
		const responseCount = responseCountRows[0]?.count || 0;

		if (responseCount > 0 || (poll.status !== "draft" && poll.status !== "active")) {
			throw new AppError("Poll can no longer be updated", 400);
		}

		const updateValues = {};
		if (data.title !== undefined) updateValues.title = data.title;
		if (data.description !== undefined) updateValues.description = data.description;
		if (data.mode !== undefined) updateValues.mode = data.mode;
		if (data.maxResponses !== undefined) updateValues.maxResponses = data.maxResponses;
		if (data.expiresIn !== undefined) {
			updateValues.expiresAt = data.expiresIn === null ? null : addHours(new Date(), data.expiresIn);
		}

		if (Object.keys(updateValues).length === 0) {
			throw new AppError("No updates provided", 400);
		}

		const updated = await this.db.update(polls).set(updateValues).where(eq(polls.id, poll.id)).returning();
		return updated[0];
	}

	async remove(pollId) {
		await this.db.delete(polls).where(eq(polls.id, pollId));
	}

	async publish(poll) {
		const normalized = await this.applyExpiry(poll);
		if (normalized.status !== "expired") {
			throw new AppError("Poll must be expired before publishing", 400);
		}

		const updated = await this.db
			.update(polls)
			.set({ status: "published", publishedAt: new Date() })
			.where(eq(polls.id, poll.id))
			.returning();

		this.socket.emitStatusUpdate(poll.id, "published");
		await this.activity.log(poll.userId, "publish", `Published poll "${poll.title}"`);

		return updated[0];
	}
}
