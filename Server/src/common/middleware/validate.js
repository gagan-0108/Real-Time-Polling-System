/**
 * validate.js — generic Zod validation middleware
 * Usage: router.post("/", validate(mySchema), handler)
 *
 * If validation fails, the ZodError is passed to next()
 * and caught by the global errorHandler which returns 400.
 */
export function validate(schema) {
	return (req, res, next) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (err) {
			next(err);
		}
	};
}

/**
 * validateQuery — validates req.query against a Zod schema
 */
export function validateQuery(schema) {
	return (req, res, next) => {
		try {
			req.query = schema.parse(req.query);
			next();
		} catch (err) {
			next(err);
		}
	};
}
