import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { responses, answers } from "./response.schema.js";
import { AppError } from "../../common/utils/app-error.js";

/**
 * ResponseService — handles response submission and listing.
 */
export class ResponseService {
	constructor(db, socketService, activityService, pollService) {
		this.db = db;
		this.socket = socketService;
		this.activity = activityService;
		this.pollService = pollService;
	}

	/**
	 * Submit a response to a poll.
	 * @param {string} pollId
	 * @param {object} poll - pre-loaded poll object
	 * @param {string|null} userId - null for anonymous
	 * @param {string|null} ipAddress
	 * @param {object} answersPayload - { questionId: optionIndex }
	 * @returns {object} { id, submittedAt }
	 */
	async submit(pollId, poll, userId, ipAddress, answersPayload) {
		// ── apply expiry ──
		const normalized = await this.pollService.applyExpiry(poll);
		if (normalized.status !== "active") {
			throw new AppError("Poll is not accepting responses", 400);
		}

		// ── max responses check ──
		const countRows = await this.db
			.select({ count: sql`count(*)`.mapWith(Number) })
			.from(responses)
			.where(eq(responses.pollId, pollId));
		if ((countRows[0]?.count || 0) >= normalized.maxResponses) {
			throw new AppError("Poll has reached max responses", 400);
		}

		// duplicate IP address check
		const isAuth = normalized.mode === "authenticated";
		if (!isAuth && ipAddress) {
			const existing = await this.db
				.select({ id: responses.id })
				.from(responses)
				.where(and(eq(responses.pollId, pollId), eq(responses.ipAddress, ipAddress)))
				.limit(1);
			if (existing.length > 0) {
				throw new AppError("Duplicate response detected", 400);
			}
		}

		// duplicate user check
		if (isAuth && userId) {
			const existing = await this.db
				.select({ id: responses.id })
				.from(responses)
				.where(and(eq(responses.pollId, pollId), eq(responses.respondentId, userId)))
				.limit(1);
			if (existing.length > 0) {
				throw new AppError("You already responded to this poll", 400);
			}
		}

		// load questions + options
		const { questionRows, optionsByQuestion } = await this.pollService._getQuestionsWithOptions(pollId);
		if (questionRows.length === 0) {
			throw new AppError("Poll has no questions", 400);
		}

		// validate answers
		const questionIdSet = new Set(questionRows.map((q) => q.id));
		for (const qId of Object.keys(answersPayload)) {
			if (!questionIdSet.has(qId)) {
				throw new AppError("Answer contains invalid question", 400);
			}
		}

		const answerRecords = [];
		for (const q of questionRows) {
			const answerIndex = answersPayload[q.id];
			if (answerIndex === undefined || answerIndex === null) {
				if (q.mandatory) {
					throw new AppError("Missing answer for mandatory question", 400);
				}
				continue;
			}

			const available = optionsByQuestion.get(q.id) || [];
			if (answerIndex < 0 || answerIndex >= available.length) {
				throw new AppError("Invalid option index", 400);
			}

			answerRecords.push({
				questionId: q.id,
				optionId: available[answerIndex].id,
				optionIndex: answerIndex,
			});
		}

		// ── insert response + answers ──
		const result = await this.db.transaction(async (tx) => {
			const insertedResponses = await tx
				.insert(responses)
				.values({
					pollId,
					respondentId: isAuth ? userId : null,
					ipAddress,
				})
				.returning();

			const response = insertedResponses[0];
			if (answerRecords.length > 0) {
				await tx.insert(answers).values(
					answerRecords.map((r) => ({
						responseId: response.id,
						questionId: r.questionId,
						optionId: r.optionId,
					}))
				);
			}

			return response;
		});

		// ── emit socket events (derive count from pre-check) ──
		const totalResponses = (countRows[0]?.count || 0) + 1;
		const completionRate = normalized.maxResponses > 0
			? Math.max(0, Math.min(100, Math.round((totalResponses / normalized.maxResponses) * 100)))
			: 0;

		for (const rec of answerRecords) {
			this.socket.emitResponse(pollId, rec.questionId, rec.optionIndex, totalResponses);
		}
		this.socket.emitResponseCount(pollId, totalResponses);
		this.socket.emitAnalyticsUpdate(pollId, { totalResponses, completionRate });

		// ── log activity ──
		await this.activity.log(poll.userId, "response", `New response on "${poll.title}"`);

		return { id: result.id, submittedAt: result.submittedAt };
	}

	/**
	 * List all responses for a poll (owner only).
	 */
	async listByPoll(pollId) {
		// ── load questions + options for index mapping ──
		const { questionRows, optionsByQuestion } = await this.pollService._getQuestionsWithOptions(pollId);

		const optionIndexById = new Map();
		for (const [questionId, optList] of optionsByQuestion.entries()) {
			optList.forEach((opt, i) => {
				optionIndexById.set(opt.id, { index: i, questionId });
			});
		}

		// load responses + answers
		const responseRows = await this.db
			.select()
			.from(responses)
			.where(eq(responses.pollId, pollId))
			.orderBy(desc(responses.submittedAt));

		const responseIds = responseRows.map((r) => r.id);
		const answerRows = responseIds.length
			? await this.db.select().from(answers).where(inArray(answers.responseId, responseIds))
			: [];

		const answersByResponse = new Map();
		for (const a of answerRows) {
			const list = answersByResponse.get(a.responseId) || [];
			list.push(a);
			answersByResponse.set(a.responseId, list);
		}

		return {
			responses: responseRows.map((r) => {
				const answersForResponse = answersByResponse.get(r.id) || [];
				const answerMap = {};
				for (const a of answersForResponse) {
					const meta = optionIndexById.get(a.optionId);
					if (meta) answerMap[a.questionId] = meta.index;
				}
				return {
					id: r.id,
					respondentId: r.respondentId,
					answers: answerMap,
					submittedAt: r.submittedAt,
				};
			}),
			total: responseRows.length,
		};
	}
}
