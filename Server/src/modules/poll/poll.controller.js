import { asyncHandler } from "../../common/utils/async-handler.js";

/**
 * PollController — thin request handlers.
 * Extracts from req, delegates to PollService, sends res.
 */
export class PollController {
	constructor(pollService) {
		this.service = pollService;
	}

	list = asyncHandler(async (req, res) => {
		const polls = await this.service.list(req.userId);
		res.json({ polls });
	});

	getById = asyncHandler(async (req, res) => {
		const poll = await this.service.getById(req.params.id);
		res.json(poll);
	});

	getPublic = asyncHandler(async (req, res) => {
		const poll = await this.service.getPublic(req.params.id);
		res.json(poll);
	});

	create = asyncHandler(async (req, res) => {
		const poll = await this.service.create(req.userId, req.body);
		res.status(201).json(poll);
	});

	update = asyncHandler(async (req, res) => {
		const updated = await this.service.update(req.poll, req.body);
		res.json(updated);
	});

	remove = asyncHandler(async (req, res) => {
		await this.service.remove(req.params.id);
		res.status(204).end();
	});

	publish = asyncHandler(async (req, res) => {
		const published = await this.service.publish(req.poll);
		res.json(published);
	});
}
