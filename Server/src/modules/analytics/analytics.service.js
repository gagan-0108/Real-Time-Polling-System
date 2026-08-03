import { eq, inArray, sql } from "drizzle-orm";
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
		const [totalRow, maxRow, modeRows, avgRow] = await Promise.all([
			// total responses
			this.db
				.select({ count: sql`count(*)`.mapWith(Number) })
				.from(responses)
				.innerJoin(polls, eq(responses.pollId, polls.id))
				.where(eq(polls.userId, userId)),
			// total max capacity
			this.db
				.select({ total: sql`coalesce(sum(${polls.maxResponses}), 0)`.mapWith(Number) })
				.from(polls)
				.where(eq(polls.userId, userId)),
			// participation by mode
			this.db
				.select({ mode: polls.mode, count: sql`count(*)`.mapWith(Number) })
				.from(responses)
				.innerJoin(polls, eq(responses.pollId, polls.id))
				.where(eq(polls.userId, userId))
				.groupBy(polls.mode),
			// avg response time (computed in SQL)
			this.db
				.select({
					avg: sql`coalesce(avg(EXTRACT(EPOCH FROM (${responses.submittedAt} - ${polls.createdAt}))), 0)`.mapWith(Number),
				})
				.from(responses)
				.innerJoin(polls, eq(responses.pollId, polls.id))
				.where(eq(polls.userId, userId)),
		]);

		const totalResponses = totalRow[0]?.count || 0;
		const completionRate = this._completionRate(totalResponses, maxRow[0]?.total || 0);

		const participationByMode = [
			{ name: "Authenticated", value: 0 },
			{ name: "Anonymous", value: 0 },
		];
		for (const row of modeRows) {
			if (row.mode === "authenticated") participationByMode[0].value = row.count;
			else if (row.mode === "anonymous") participationByMode[1].value = row.count;
		}

		return {
			totalResponses,
			avgResponseTime: this._formatDuration(avgRow[0]?.avg || 0),
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
		const [questionRows, optionCounts] = await Promise.all([
			this.db
				.select()
				.from(questions)
				.where(eq(questions.pollId, pollId))
				.orderBy(questions.sortOrder),
			this.db
				.select({ optionId: answers.optionId, count: sql`count(*)`.mapWith(Number) })
				.from(answers)
				.innerJoin(responses, eq(answers.responseId, responses.id))
				.where(eq(responses.pollId, pollId))
				.groupBy(answers.optionId),
		]);

		const questionIds = questionRows.map((q) => q.id);
		const optionRows = questionIds.length
			? await this.db
					.select()
					.from(options)
					.where(inArray(options.questionId, questionIds))
					.orderBy(options.sortOrder)
			: [];

		const countsByOptionId = new Map(optionCounts.map((r) => [r.optionId, r.count]));

		const optionsByQuestion = new Map();
		for (const opt of optionRows) {
			const list = optionsByQuestion.get(opt.questionId) || [];
			list.push(opt);
			optionsByQuestion.set(opt.questionId, list);
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
		const [pollRows, responseRows] = await Promise.all([
			this.db
				.select({
					month: sql`to_char(date_trunc('month', ${polls.createdAt}), 'Mon')`.mapWith(String),
					count: sql`count(*)`.mapWith(Number),
				})
				.from(polls)
				.where(eq(polls.userId, userId))
				.groupBy(sql`date_trunc('month', ${polls.createdAt})`)
				.orderBy(sql`date_trunc('month', ${polls.createdAt})`),
			this.db
				.select({
					month: sql`to_char(date_trunc('month', ${responses.submittedAt}), 'Mon')`.mapWith(String),
					count: sql`count(*)`.mapWith(Number),
				})
				.from(responses)
				.innerJoin(polls, eq(responses.pollId, polls.id))
				.where(eq(polls.userId, userId))
				.groupBy(sql`date_trunc('month', ${responses.submittedAt})`)
				.orderBy(sql`date_trunc('month', ${responses.submittedAt})`),
		]);

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
