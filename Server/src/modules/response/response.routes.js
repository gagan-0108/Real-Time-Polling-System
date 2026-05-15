import express from "express";
import { validate } from "../../common/middleware/validate.js";
import { submitResponseSchema } from "./response.dto.js";

/**
 * createResponseRoutes — wires response routes.
 */
export function createResponseRoutes(controller, authMiddleware, pollMiddleware) {
	const router = express.Router();
	const { requireAuthAndUser, ensureOptionalUser } = authMiddleware;
	const { requirePollOwnership, loadPoll } = pollMiddleware;

	// POST /api/polls/:id/responses — submit a response
	router.post(
		"/polls/:id/responses",
		ensureOptionalUser,
		loadPoll,
		validate(submitResponseSchema),
		controller.submit
	);

	// GET /api/polls/:id/responses — list responses (owner only)
	router.get(
		"/polls/:id/responses",
		requireAuthAndUser,
		requirePollOwnership,
		controller.list
	);

	return router;
}
