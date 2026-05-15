/**
 * asyncHandler — wraps async Express handlers to auto-catch errors.
 */
export function asyncHandler(handler) {
	return (req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next);
	};
}
