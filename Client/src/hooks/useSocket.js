import { useState, useEffect, useRef, useCallback } from "react";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─────────────────────────────────────────────────────────
//  To enable real-time Socket.io:
//  1. Install: pnpm add socket.io-client
//  2. Set USE_SOCKET = true below
//  3. Uncomment: const { io } = await import("socket.io-client");
//     inside the useEffect in useSocket()
// ─────────────────────────────────────────────────────────

const USE_SOCKET = false;


/**
 * useSocket — manages a Socket.io connection.
 * Set USE_SOCKET = true and import socket.io-client to enable.
 */
export function useSocket() {
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef(null);

	useEffect(() => {
		if (!USE_SOCKET) {
			// Offline mode — no real-time features
			return;
		}

		let cancelled = false;
		let socket = null;

		// Dynamic import so the app builds even without socket.io-client
		import("socket.io-client").then(({ io }) => {
			if (cancelled) return;

			socket = io(SOCKET_URL, {
				transports: ["websocket", "polling"],
			});

			socketRef.current = socket;
			socket.on("connect", () => setIsConnected(true));
			socket.on("disconnect", () => setIsConnected(false));
		}).catch(() => {
			// socket.io-client not installed
		});

		return () => {
			cancelled = true;
			if (socket) {
				socket.disconnect();
				socketRef.current = null;
				setIsConnected(false);
			}
		};
	}, []);

	const emit = useCallback((event, data) => {
		if (socketRef.current) {
			socketRef.current.emit(event, data);
		}
	}, []);

	const on = useCallback((event, handler) => {
		if (socketRef.current) {
			socketRef.current.on(event, handler);
			return () => socketRef.current?.off(event, handler);
		}
		return () => {};
	}, []);

	return { isConnected, emit, on, socket: socketRef.current };
}

/**
 * usePollRoom — joins a poll room and subscribes to live events.
 * Returns { responseCount, isLive }.
 */
export function usePollRoom(pollId) {
	const { isConnected, emit, on } = useSocket();
	const [responseCount, setResponseCount] = useState(0);
	const [isLive, setIsLive] = useState(false);

	useEffect(() => {
		if (!isConnected || !pollId) return;

		emit("poll:join", { pollId });
		setIsLive(true);

		const offCount = on("poll:response:count", (data) => {
			if (data.pollId === pollId) {
				setResponseCount(data.count);
			}
		});

		const offResponse = on("poll:response:new", (data) => {
			if (data.pollId === pollId) {
				setResponseCount(data.totalResponses);
			}
		});

		return () => {
			emit("poll:leave", { pollId });
			offCount();
			offResponse();
			setIsLive(false);
		};
	}, [isConnected, pollId, emit, on]);

	return { responseCount, isLive };
}

/**
 * usePollStatus — listens for poll status changes (expired, published).
 */
export function usePollStatus(pollId) {
	const { isConnected, emit, on } = useSocket();
	const [status, setStatus] = useState(null);

	useEffect(() => {
		if (!isConnected || !pollId) return;

		emit("poll:join", { pollId });

		const off = on("poll:status:update", (data) => {
			if (data.pollId === pollId) {
				setStatus(data.status);
			}
		});

		return () => {
			emit("poll:leave", { pollId });
			off();
		};
	}, [isConnected, pollId, emit, on]);

	return { status };
}

/**
 * usePollTimer — countdown hook for poll expiry.
 */
export function usePollTimer(expiresAt) {
	const [timeLeft, setTimeLeft] = useState(0);

	useEffect(() => {
		if (!expiresAt) return;

		const calc = () => {
			const diff = new Date(expiresAt) - Date.now();
			setTimeLeft(Math.max(0, diff));
		};

		calc();
		const id = setInterval(calc, 1000);
		return () => clearInterval(id);
	}, [expiresAt]);

	const isExpired = timeLeft <= 0;
	const totalSecs = Math.floor(timeLeft / 1000);
	const hours = Math.floor(totalSecs / 3600);
	const minutes = Math.floor((totalSecs % 3600) / 60);
	const seconds = totalSecs % 60;

	const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

	return { timeLeft, isExpired, hours, minutes, seconds, formatted };
}
