import express from "express";

/**
 * createUserRoutes — wires user routes.
 */
export function createUserRoutes(controller, authMiddleware) {
	const router = express.Router();
	const { requireAuthAndUser } = authMiddleware;

	// GET /api/user/plan — current plan & usage
	router.get("/plan", requireAuthAndUser, controller.plan);

	// GET /api/user/activity — recent activity feed
	router.get("/activity", requireAuthAndUser, controller.activity);

	return router;
}
