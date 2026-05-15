import { pgTable, text, uuid, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { polls } from "../poll/poll.schema.js";
import { questions, options } from "../poll/poll.schema.js";
import { users } from "../auth/auth.schema.js";

export const responses = pgTable(
	"responses",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		pollId: uuid("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
		respondentId: text("respondent_id").references(() => users.id),
		ipAddress: text("ip_address"),
		submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		pollSubmittedIdx: index("responses_poll_submitted_idx").on(table.pollId, table.submittedAt),
		pollIpIdx: index("responses_poll_ip_idx").on(table.pollId, table.ipAddress),
		pollRespondentUnique: uniqueIndex("responses_poll_respondent_unique")
			.on(table.pollId, table.respondentId)
			.where(sql`${table.respondentId} is not null`),
	})
);

export const answers = pgTable(
	"answers",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		responseId: uuid("response_id").notNull().references(() => responses.id, { onDelete: "cascade" }),
		questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "restrict" }),
		optionId: uuid("option_id").notNull().references(() => options.id, { onDelete: "restrict" }),
	},
	(table) => ({
		responseIdx: index("answers_response_idx").on(table.responseId),
		questionIdx: index("answers_question_idx").on(table.questionId),
	})
);
