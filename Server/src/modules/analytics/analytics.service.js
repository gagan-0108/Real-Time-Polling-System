import { and, eq, inArray, sql } from "drizzle-orm";
import { polls, questions, options } from "../poll/poll.schema.js";
import { responses, answers } from "../response/response.schema.js";

/**
 * AnalyticsService — all analytics queries.
 * No Express awareness — pure data retrieval.
 */
export class AnalyticsService {
	constructor(db) {
		this.db = db;
	}

	_completionRate(count, max) {
		if (!max || max <= 0) return 0;
		return Math.max(0, Math.min(100, Math.round((count / max) * 100)));
	}

	_formatDuration(totalSeconds) {
		if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0m 0s";
		const m = Math.floor(totalSeconds / 60);
		const s = Math.round(totalSeconds % 60);
		return `${m}m ${s}s`;
	}

	/**
	 * Overall analytics for all polls owned by a user.
	 */
	async getOverview(userId) {
		// total responses
		const totalRow = await this.db
			.select({ count: sql`count(*)`.mapWith(Number) })
			.from(responses)
			.innerJoin(polls, eq(responses.pollId, polls.id))
			.where(eq(polls.userId, userId));
		const totalResponses = totalRow[0]?.count || 0;

		// total max capacity
		const maxRow = await this.db
			.select({ total: sql`coalesce(sum(${polls.maxResponses}), 0)`.mapWith(Number) })
			.from(polls)
			.where(eq(polls.userId, userId));
		const completionRate = this._completionRate(totalResponses, maxRow[0]?.total || 0);

		// participation by mode
		const modeRows = await this.db
			.select({ mode: polls.mode, count: sql`count(*)`.mapWith(Number) })
			.from(responses)
			.innerJoin(polls, eq(responses.pollId, polls.id))
			.where(eq(polls.userId, userId))
			.groupBy(polls.mode);

		const participationByMode = [
			{ name: "Authenticated", value: 0 },
			{ name: "Anonymous", value: 0 },
		];
		for (const row of modeRows) {
			if (row.mode === "authenticated") participationByMode[0].value = row.count;
			else if (row.mode === "anonymous") participationByMode[1].value = row.count;
		}

		// avg response time
		const timeRows = await this.db
			.select({ createdAt: polls.createdAt, submittedAt: responses.submittedAt })
			.from(responses)
			.innerJoin(polls, eq(responses.pollId, polls.id))
			.where(eq(polls.userId, userId));

		let avgSeconds = 0;
		if (timeRows.length > 0) {
			const total = timeRows.reduce((acc, r) => {
				return acc + Math.max(0, (r.submittedAt.getTime() - r.createdAt.getTime()) / 1000);
			}, 0);
			avgSeconds = total / timeRows.length;
		}

		return {
			totalResponses,
			avgResponseTime: this._formatDuration(avgSeconds),
			completionRate,
			participationByMode,
		};
	}

	/**
	 * Per-poll analytics: totals + responses by day.
	 */
	async getPollAnalytics(pollId, poll) {
		const totalRow = await this.db
			.select({ count: sql`count(*)`.mapWith(Number) })
			.from(responses)
			.where(eq(responses.pollId, pollId));
		const totalResponses = totalRow[0]?.count || 0;
		const completionRate = this._completionRate(totalResponses, poll.maxResponses);

		const byDay = await this.db
			.select({
				date: sql`to_char(${responses.submittedAt}, 'YYYY-MM-DD')`.mapWith(String),
				count: sql`count(*)`.mapWith(Number),
			})
			.from(responses)
			.where(eq(responses.pollId, pollId))
			.groupBy(sql`to_char(${responses.submittedAt}, 'YYYY-MM-DD')`)
			.orderBy(sql`to_char(${responses.submittedAt}, 'YYYY-MM-DD')`);

		return {
			pollId,
			totalResponses,
			completionRate,
			responsesByDay: byDay.map((r) => ({ date: r.date, count: r.count })),
		};
	}

	/**
	 * Per-question breakdown: option counts and percentages.
	 */
	async getQuestionAnalytics(pollId) {
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

		const optionCounts = await this.db
			.select({ optionId: answers.optionId, count: sql`count(*)`.mapWith(Number) })
			.from(answers)
			.innerJoin(responses, eq(answers.responseId, responses.id))
			.where(eq(responses.pollId, pollId))
			.groupBy(answers.optionId);

		const countsByOptionId = new Map(optionCounts.map((r) => [r.optionId, r.count]));

		const optionsByQuestion = new Map();
		for (const opt of optionRows) {
			const list = optionsByQuestion.get(opt.questionId) || [];
			list.push(opt);
			optionsByQuestion.set(opt.questionId, list);
		}
		for (const list of optionsByQuestion.values()) {
			list.sort((a, b) => a.sortOrder - b.sortOrder);
		}

		const totalRow = await this.db
			.select({ count: sql`count(*)`.mapWith(Number) })
			.from(responses)
			.where(eq(responses.pollId, pollId));
		const totalResponses = totalRow[0]?.count || 0;

		return {
			pollId,
			questions: questionRows.map((q) => {
				const qOptions = optionsByQuestion.get(q.id) || [];
				return {
					id: q.id,
					text: q.text,
					mandatory: q.mandatory,
					options: qOptions.map((o) => {
						const count = countsByOptionId.get(o.id) || 0;
						const pct = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
						return { label: o.label, count, pct };
					}),
					totalResponses,
				};
			}),
		};
	}

	/**
	 * Monthly trends: polls created + responses received per month.
	 */
	async getTrends(userId) {
		const pollRows = await this.db
			.select({
				month: sql`to_char(date_trunc('month', ${polls.createdAt}), 'Mon')`.mapWith(String),
				count: sql`count(*)`.mapWith(Number),
			})
			.from(polls)
			.where(eq(polls.userId, userId))
			.groupBy(sql`date_trunc('month', ${polls.createdAt})`)
			.orderBy(sql`date_trunc('month', ${polls.createdAt})`);

		const responseRows = await this.db
			.select({
				month: sql`to_char(date_trunc('month', ${responses.submittedAt}), 'Mon')`.mapWith(String),
				count: sql`count(*)`.mapWith(Number),
			})
			.from(responses)
			.innerJoin(polls, eq(responses.pollId, polls.id))
			.where(eq(polls.userId, userId))
			.groupBy(sql`date_trunc('month', ${responses.submittedAt})`)
			.orderBy(sql`date_trunc('month', ${responses.submittedAt})`);

		const responseMap = new Map(responseRows.map((r) => [r.month, r.count]));

		return {
			months: pollRows.map((r) => ({
				month: r.month,
				polls: r.count,
				responses: responseMap.get(r.month) || 0,
			})),
		};
	}
}
