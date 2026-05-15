import express from "express";
import { validate } from "../../common/middleware/validate.js";
import { createPollSchema, updatePollSchema } from "./poll.dto.js";

/**
 * createPollRoutes — wires poll routes with middleware and controller.
 * Pure route definitions — no business logic.
 */
export function createPollRoutes(controller, authMiddleware, pollMiddleware) {
	const router = express.Router();
	const { requireAuthAndUser } = authMiddleware;
	const { requirePollOwnership, loadPoll } = pollMiddleware;

	// GET /api/polls — list current user's polls
	router.get("/", requireAuthAndUser, controller.list);

	// GET /api/polls/:id — get full poll details (owner only)
	router.get("/:id", requireAuthAndUser, requirePollOwnership, controller.getById);

	// GET /api/polls/:id/public — get public poll info (no auth)
	router.get("/:id/public", loadPoll, controller.getPublic);

	// POST /api/polls — create a new poll
	router.post("/", requireAuthAndUser, validate(createPollSchema), controller.create);

	// PATCH /api/polls/:id — update poll (owner, draft/active only)
	router.patch("/:id", requireAuthAndUser, requirePollOwnership, validate(updatePollSchema), controller.update);

	// DELETE /api/polls/:id — delete poll (owner only)
	router.delete("/:id", requireAuthAndUser, requirePollOwnership, controller.remove);

	// POST /api/polls/:id/publish — publish results (owner, expired only)
	router.post("/:id/publish", requireAuthAndUser, requirePollOwnership, controller.publish);

	return router;
}
