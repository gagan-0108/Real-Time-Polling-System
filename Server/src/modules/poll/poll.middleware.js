import { eq } from "drizzle-orm";
import { polls } from "./poll.schema.js";
import { asyncHandler } from "../../common/utils/async-handler.js";

/**
 * createPollMiddleware — factory that creates poll-specific middleware
 * using an injected DB instance.
 */
export function createPollMiddleware(db) {
	/**
	 * requirePollOwnership — loads poll, checks ownership.
	 * Must be placed AFTER requireAuthAndUser in the middleware chain.
	 */
	const requirePollOwnership = asyncHandler(async (req, res, next) => {
		const pollId = req.params.id;
		if (!pollId) {
			return res.status(400).json({ message: "Poll ID required" });
		}

		const rows = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1);
		if (rows.length === 0) {
			return res.status(404).json({ message: "Poll not found" });
		}

		const poll = rows[0];
		if (poll.userId !== req.userId) {
			return res.status(403).json({ message: "Forbidden" });
		}

		req.poll = poll;
		next();
	});

	/**
	 * loadPoll — loads a poll by ID without ownership check.
	 * Used for public endpoints.
	 */
	const loadPoll = asyncHandler(async (req, res, next) => {
		const pollId = req.params.id;
		if (!pollId) {
			return res.status(400).json({ message: "Poll ID required" });
		}

		const rows = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1);
		if (rows.length === 0) {
			return res.status(404).json({ message: "Poll not found" });
		}

		req.poll = rows[0];
		next();
	});

	return { requirePollOwnership, loadPoll };
}
