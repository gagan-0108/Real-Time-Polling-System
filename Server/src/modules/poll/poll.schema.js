import { pgEnum, pgTable, text, uuid, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema.js";

export const pollStatusEnum = pgEnum("poll_status", ["draft", "active", "expired", "published"]);
export const pollModeEnum = pgEnum("poll_mode", ["authenticated", "anonymous"]);

export const polls = pgTable(
	"polls",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id").notNull().references(() => users.id),
		title: text("title").notNull(),
		description: text("description"),
		mode: pollModeEnum("mode").notNull().default("authenticated"),
		status: pollStatusEnum("status").notNull().default("active"),
		maxResponses: integer("max_responses").notNull().default(500),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		publishedAt: timestamp("published_at", { withTimezone: true }),
	},
	(table) => ({
		userCreatedIdx: index("polls_user_created_idx").on(table.userId, table.createdAt),
		statusIdx: index("polls_status_idx").on(table.status),
	})
);

export const questions = pgTable(
	"questions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		pollId: uuid("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
		text: text("text").notNull(),
		mandatory: boolean("mandatory").notNull().default(true),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		pollOrderIdx: index("questions_poll_order_idx").on(table.pollId, table.sortOrder),
	})
);

export const options = pgTable(
	"options",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
		label: text("label").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(table) => ({
		questionOrderIdx: index("options_question_order_idx").on(table.questionId, table.sortOrder),
	})
);
