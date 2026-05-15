import { asyncHandler } from "../../common/utils/async-handler.js";

/**
 * AnalyticsController — thin request handlers.
 */
export class AnalyticsController {
	constructor(analyticsService) {
		this.service = analyticsService;
	}

	overview = asyncHandler(async (req, res) => {
		const data = await this.service.getOverview(req.userId);
		res.json(data);
	});

	pollAnalytics = asyncHandler(async (req, res) => {
		const data = await this.service.getPollAnalytics(req.params.id, req.poll);
		res.json(data);
	});

	questionAnalytics = asyncHandler(async (req, res) => {
		const data = await this.service.getQuestionAnalytics(req.params.id);
		res.json(data);
	});

	trends = asyncHandler(async (req, res) => {
		const data = await this.service.getTrends(req.userId);
		res.json(data);
	});
}
