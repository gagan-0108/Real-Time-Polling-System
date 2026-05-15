/**
 * AppError — reusable error class with HTTP status code.
 * Throw from any service; caught by the global errorHandler.
 *
 * Usage: throw new AppError("Not found", 404);
 */
export class AppError extends Error {
	constructor(message, statusCode = 500, code = null) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.name = "AppError";
	}
}
