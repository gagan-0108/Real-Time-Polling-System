import { z } from "zod";

/**
 * Zod schema (DTO) for response submission.
 */
export const submitResponseSchema = z.object({
	answers: z.record(z.number().int().nonnegative()),
});
