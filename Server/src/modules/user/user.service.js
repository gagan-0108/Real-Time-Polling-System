import { and, desc, eq, sql } from "drizzle-orm";
import { users } from "../auth/auth.schema.js";
import { polls } from "../poll/poll.schema.js";
import { responses } from "../response/response.schema.js";
import { userActivity } from "./user.schema.js";
import { config } from "../../common/config/env.js";
import { getBillingPeriodEnd } from "../../common/utils/time.js";

/**
 * UserService — plan/usage, activity feed, and activity logging.
 * Combines the old UserService + ActivityService into a single module.
 */
export class UserService {
    constructor(db) {
        this.db = db;
    }

    // ── Activity Logging (used by poll & response modules via DI) ──

    /**
     * Log a user activity entry.
     * @param {string} userId
     * @param {"response"|"create"|"publish"|"expire"} type
     * @param {string} text
     * @param {object} [txOrDb] optional transaction context
     */
    async log(userId, type, text, txOrDb) {
        if (!userId) return;

        const conn = txOrDb || this.db;
        await conn.insert(userActivity).values({ userId, type, text });
    }

    // ── Plan & Usage ──

    /**
     * Get current plan, usage counts, and limits.
     */
    async getPlan(userId) {
        const userRow = await this.db
            .select({ plan: users.plan, email: users.email })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        const plan = userRow[0]?.plan || "free";
        const email = (userRow[0]?.email || "").toLowerCase();
        const isUnlimited = config.unlimitedEmails.has(email);

        const [authUsedRow, anonUsedRow, storedRow] = await Promise.all([
            this.db
                .select({ count: sql`count(*)`.mapWith(Number) })
                .from(polls)
                .where(and(eq(polls.userId, userId), eq(polls.mode, "authenticated"), eq(polls.status, "active"))),
            this.db
                .select({ count: sql`count(*)`.mapWith(Number) })
                .from(polls)
                .where(and(eq(polls.userId, userId), eq(polls.mode, "anonymous"), eq(polls.status, "active"))),
            this.db
                .select({ count: sql`count(*)`.mapWith(Number) })
                .from(responses)
                .innerJoin(polls, eq(responses.pollId, polls.id))
                .where(eq(polls.userId, userId)),
        ]);

        const limits = config.planLimits;

        return {
            plan,
            unlimited: isUnlimited,
            authPollsUsed: authUsedRow[0]?.count || 0,
            authPollsLimit: isUnlimited ? -1 : limits.auth,
            anonPollsUsed: anonUsedRow[0]?.count || 0,
            anonPollsLimit: isUnlimited ? -1 : limits.anon,
            responsesStored: storedRow[0]?.count || 0,
            responsesLimit: isUnlimited ? -1 : limits.responses,
            billingPeriodEnd: getBillingPeriodEnd(),
        };
    }

    // ── Activity Feed ──

    /**
     * Get recent activity feed for a user.
     */
    async getActivity(userId) {
        const rows = await this.db
            .select()
            .from(userActivity)
            .where(eq(userActivity.userId, userId))
            .orderBy(desc(userActivity.createdAt))
            .limit(50);

        return {
            activity: rows.map((entry) => ({
                id: entry.id,
                type: entry.type,
                text: entry.text,
                time: entry.createdAt,
            })),
        };
    }
}
