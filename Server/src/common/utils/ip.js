/**
 * getRequestIp — extracts client IP from an Express request.
 */
export function getRequestIp(req) {
	const forwarded = req.headers["x-forwarded-for"];
	if (typeof forwarded === "string" && forwarded.length > 0) {
		return forwarded.split(",")[0].trim();
	}

	if (Array.isArray(forwarded) && forwarded.length > 0) {
		return forwarded[0];
	}

	return req.ip || req.socket?.remoteAddress || null;
}
