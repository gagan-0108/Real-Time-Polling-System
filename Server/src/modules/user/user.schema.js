import { pgEnum, pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema.js";

export const activityTypeEnum = pgEnum("activity_type", ["response", "create", "publish", "expire"]);

export const userActivity = pgTable(
	"user_activity",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
		type: activityTypeEnum("type").notNull(),
		text: text("text").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		userCreatedIdx: index("user_activity_user_created_idx").on(table.userId, table.createdAt),
	})
);
