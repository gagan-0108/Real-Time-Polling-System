import { asyncHandler } from "../../common/utils/async-handler.js";

export class UserController {
	constructor(userService) {
		this.service = userService;
	}

	plan = asyncHandler(async (req, res) => {
		const data = await this.service.getPlan(req.userId);
		res.json(data);
	});

	activity = asyncHandler(async (req, res) => {
		const data = await this.service.getActivity(req.userId);
		res.json(data);
	});
}
