/**
 * SocketService — wraps Socket.io room-based event emitters.
 * All real-time communication goes through this service.
 * Lives in common/ because it's cross-cutting infrastructure.
 */
export class SocketService {
	constructor(io) {
		this.io = io;
	}

	/** Get the room name for a poll */
	getRoom(pollId) {
		return `poll:${pollId}`;
	}

	/** Emit when a new response answer is submitted */
	emitResponse(pollId, questionId, optionIndex, totalResponses) {
		if (!this.io) return;
		this.io.to(this.getRoom(pollId)).emit("poll:response:new", {
			pollId,
			questionId,
			optionIndex,
			totalResponses,
		});
	}

	/** Emit updated total response count for a poll */
	emitResponseCount(pollId, count) {
		if (!this.io) return;
		this.io.to(this.getRoom(pollId)).emit("poll:response:count", {
			pollId,
			count,
		});
	}

	/** Emit poll status change (expired, published) */
	emitStatusUpdate(pollId, status) {
		if (!this.io) return;
		this.io.to(this.getRoom(pollId)).emit("poll:status:update", {
			pollId,
			status,
		});
	}

	/** Emit live analytics snapshot */
	emitAnalyticsUpdate(pollId, analytics) {
		if (!this.io) return;
		this.io.to(this.getRoom(pollId)).emit("poll:analytics:update", {
			pollId,
			analytics,
		});
	}
}
