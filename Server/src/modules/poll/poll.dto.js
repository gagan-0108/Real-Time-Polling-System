import { z } from "zod";

/**
 * Zod schemas (DTOs) for poll-related request validation.
 */

export const createPollSchema = z.object({
	title: z.string().min(1),
	description: z.string().nullable().optional(),
	mode: z.enum(["authenticated", "anonymous"]).default("authenticated"),
	expiresIn: z.number().int().positive().optional(),
	maxResponses: z.number().int().positive().optional(),
	questions: z
		.array(
			z.object({
				text: z.string().min(1),
				mandatory: z.boolean().optional().default(true),
				options: z.array(z.string().min(1)).min(2),
			})
		)
		.min(1),
});

export const updatePollSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().nullable().optional(),
	mode: z.enum(["authenticated", "anonymous"]).optional(),
	expiresIn: z.number().int().positive().nullable().optional(),
	maxResponses: z.number().int().positive().optional(),
});
