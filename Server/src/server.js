import "dotenv/config";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { config } from "./common/config/env.js";
import { createApp } from "./app.js";

function buildSocketCors() {
	if (config.corsOrigin === "*") {
		return { origin: "*" };
	}
	return {
		origin: config.corsOrigin,
		credentials: true,
	};
}

// ── create http server + Socket.io ──
const httpServer = http.createServer();
const io = new SocketIOServer(httpServer, {
	cors: buildSocketCors(),
});

// ── create express app with io injected ──
const app = createApp(io);
httpServer.on("request", app);

// ── Socket.io room management ──
io.on("connection", (socket) => {
	socket.on("poll:join", (payload) => {
		const pollId = payload?.pollId;
		if (!pollId) return;
		socket.join(`poll:${pollId}`);
	});

	socket.on("poll:leave", (payload) => {
		const pollId = payload?.pollId;
		if (!pollId) return;
		socket.leave(`poll:${pollId}`);
	});
});

// ── start ──
httpServer.listen(config.port, () => {
	console.log(`Server listening on port ${config.port}`);
});
