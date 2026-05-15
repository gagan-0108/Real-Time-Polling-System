import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { config } from "./common/config/env.js";
import { db } from "./common/db/index.js";

// ── common services ──
import { SocketService } from "./common/socket/socket.service.js";

// ── modules ──
import { AuthService } from "./modules/auth/auth.service.js";
import { createAuthMiddleware } from "./modules/auth/auth.middleware.js";

import { PollService } from "./modules/poll/poll.service.js";
import { PollController } from "./modules/poll/poll.controller.js";
import { createPollMiddleware } from "./modules/poll/poll.middleware.js";
import { createPollRoutes } from "./modules/poll/poll.routes.js";

import { ResponseService } from "./modules/response/response.service.js";
import { ResponseController } from "./modules/response/response.controller.js";
import { createResponseRoutes } from "./modules/response/response.routes.js";

import { AnalyticsService } from "./modules/analytics/analytics.service.js";
import { AnalyticsController } from "./modules/analytics/analytics.controller.js";
import { createAnalyticsRoutes } from "./modules/analytics/analytics.routes.js";

import { UserService } from "./modules/user/user.service.js";
import { UserController } from "./modules/user/user.controller.js";
import { createUserRoutes } from "./modules/user/user.routes.js";

// ── common middleware ──
import { errorHandler, notFoundHandler } from "./common/middleware/error.js";

function buildCorsOptions() {
	if (config.corsOrigin === "*") {
		return { origin: "*" };
	}
	return {
		origin: config.corsOrigin,
		credentials: true,
	};
}

/**
 * createApp — builds the Express app with dependency-injected modules.
 *
 * @param {import("socket.io").Server} io — Socket.io server instance
 */
export function createApp(io) {
	const app = express();

	// ── global middleware ──
	app.set("trust proxy", true);
	app.use(cors(buildCorsOptions()));
	app.use(express.json({ limit: "1mb" }));
	app.use(clerkMiddleware());

	// ── initialize common services ──
	const socketService = new SocketService(io);

	// ── initialize modules ──

	// Auth
	const authService = new AuthService(db);
	const authMiddleware = createAuthMiddleware(authService);

	// User (includes activity logging — injected into poll & response)
	const userService = new UserService(db);
	const userController = new UserController(userService);

	// Poll
	const pollService = new PollService(db, socketService, userService);
	const pollController = new PollController(pollService);
	const pollMiddleware = createPollMiddleware(db);

	// Response
	const responseService = new ResponseService(db, socketService, userService, pollService);
	const responseController = new ResponseController(responseService, authService);

	// Analytics
	const analyticsService = new AnalyticsService(db);
	const analyticsController = new AnalyticsController(analyticsService);

	// ── store io for Socket.io room management in server.js ──
	app.set("io", io);

	// ── health check ──
	app.get("/api/health", (req, res) => {
		res.json({ ok: true });
	});

	// ── mount module routes ──
	app.use("/api/polls", createPollRoutes(pollController, authMiddleware, pollMiddleware));
	app.use("/api", createResponseRoutes(responseController, authMiddleware, pollMiddleware));
	app.use("/api/analytics", createAnalyticsRoutes(analyticsController, authMiddleware, pollMiddleware));
	app.use("/api/user", createUserRoutes(userController, authMiddleware));

	// ── error handling ──
	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}
