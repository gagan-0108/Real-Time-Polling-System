import express from "express";

/**
 * createAnalyticsRoutes — wires analytics routes.
 */
export function createAnalyticsRoutes(controller, authMiddleware, pollMiddleware) {
	const router = express.Router();
	const { requireAuthAndUser } = authMiddleware;
	const { requirePollOwnership } = pollMiddleware;

	// GET /api/analytics/overview — overall user analytics
	router.get("/overview", requireAuthAndUser, controller.overview);

	// GET /api/analytics/polls/:id — per-poll analytics (owner only)
	router.get("/polls/:id", requireAuthAndUser, requirePollOwnership, controller.pollAnalytics);

	// GET /api/analytics/polls/:id/questions — per-question breakdown (owner only)
	router.get("/polls/:id/questions", requireAuthAndUser, requirePollOwnership, controller.questionAnalytics);

	// GET /api/analytics/trends — monthly trends
	router.get("/trends", requireAuthAndUser, controller.trends);

	return router;
}
