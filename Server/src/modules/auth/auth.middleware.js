import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../../common/utils/async-handler.js";

/**
 * createAuthMiddleware — factory that creates auth middleware
 * using an injected AuthService instance.
 */
export function createAuthMiddleware(authService) {
	const requireClerkAuth = requireAuth();

	/**
	 * ensureUser — requires auth, ensures DB record exists.
	 */
	const ensureUser = asyncHandler(async (req, res, next) => {
		const userId = req.auth?.userId;
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		await authService.ensureUserRecord(userId, req.auth?.sessionClaims);
		req.userId = userId;
		next();
	});

	/**
	 * ensureOptionalUser — if signed in, ensures DB record.
	 * Continues regardless of auth status.
	 */
	const ensureOptionalUser = asyncHandler(async (req, res, next) => {
		const userId = req.auth?.userId;
		if (!userId) return next();

		await authService.ensureUserRecord(userId, req.auth?.sessionClaims);
		req.userId = userId;
		next();
	});

	/** Convenience chain: clerk auth → ensure user record */
	const requireAuthAndUser = [requireClerkAuth, ensureUser];

	return {
		requireClerkAuth,
		ensureUser,
		ensureOptionalUser,
		requireAuthAndUser,
		// Expose the service instance for direct use (e.g., in response controller)
		authService,
	};
}
