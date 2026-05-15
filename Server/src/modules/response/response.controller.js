import { asyncHandler } from "../../common/utils/async-handler.js";
import { getRequestIp } from "../../common/utils/ip.js";

/**
 * ResponseController — thin request handlers for response submission.
 */
export class ResponseController {
	constructor(responseService, authService) {
		this.service = responseService;
		this.authService = authService;
	}

	submit = asyncHandler(async (req, res) => {
		const poll = req.poll;
		const userId = req.auth?.userId || null;

		// enforce auth for authenticated polls
		if (poll.mode === "authenticated" && !userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		// ensure user record exists for authenticated responses
		if (poll.mode === "authenticated" && userId) {
			await this.authService.ensureUserRecord(userId, req.auth?.sessionClaims);
		}

		const ipAddress = getRequestIp(req);
		const result = await this.service.submit(
			req.params.id,
			poll,
			userId,
			ipAddress,
			req.body.answers
		);

		res.status(201).json(result);
	});

	list = asyncHandler(async (req, res) => {
		const data = await this.service.listByPoll(req.params.id);
		res.json(data);
	});
}
