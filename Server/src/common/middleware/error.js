import { ZodError } from "zod";

export function notFoundHandler(req, res) {
	console.log(`[404] ${req.method} ${req.originalUrl}`);
	res.status(404).json({ message: "Not found" });
}

export function errorHandler(err, req, res, next) {
	console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message || err);

	if (err instanceof ZodError) {
		return res.status(400).json({
			message: "Validation error",
			issues: err.issues,
		});
	}

	const status = err.statusCode || err.status || 500;
	const message = err.message || "Internal server error";
	const response = { message };
	if (err.code) response.code = err.code;
	res.status(status).json(response);
}
