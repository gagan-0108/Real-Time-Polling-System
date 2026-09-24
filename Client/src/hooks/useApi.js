import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

/**
 * getAuthHeaders — creates an auth header object from a Clerk token.
 */
export function getAuthHeaders(token) {
	const headers = { "Content-Type": "application/json" };
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	return headers;
}

/**
 * request — generic fetch wrapper. Needs a token string for auth.
 */
async function request(path, token, options = {}) {
	const { headers: extraHeaders, ...rest } = options;
	const res = await fetch(`${API_BASE}${path}`, {
		...rest,
		headers: {
			...getAuthHeaders(token),
			...extraHeaders,
		},
	});

	if (res.status === 204) return null;

	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: res.statusText }));
		throw new Error(err.message || "API error");
	}

	return res.json();
}

/**
 * createApiClient — returns an API client that fetches a fresh token per call.
 * Accepts a getTokenFn that returns a Promise<string> (e.g. Clerk's getToken).
 * This prevents stale JWT errors when the user sits on a page for a while.
 */
export function createApiClient(getTokenFn) {
	const r = async (path, opts) => {
		const token = typeof getTokenFn === "function" ? await getTokenFn() : getTokenFn;
		return request(path, token, opts);
	};

	return {
		polls: {
			list: () => r("/polls"),
			get: (id) => r(`/polls/${id}`),
			create: (data) => r("/polls", { method: "POST", body: JSON.stringify(data) }),
			update: (id, data) => r(`/polls/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
			delete: (id) => r(`/polls/${id}`, { method: "DELETE" }),
			publish: (id) => r(`/polls/${id}/publish`, { method: "POST" }),
			getPublic: (id) => r(`/polls/${id}/public`),
		},
		responses: {
			submit: (pollId, answers) =>
				r(`/polls/${pollId}/responses`, { method: "POST", body: JSON.stringify({ answers }) }),
			list: (pollId) => r(`/polls/${pollId}/responses`),
		},
		analytics: {
			overview: () => r("/analytics/overview"),
			pollAnalytics: (pollId) => r(`/analytics/polls/${pollId}`),
			questionAnalytics: (pollId) => r(`/analytics/polls/${pollId}/questions`),
			trends: () => r("/analytics/trends"),
		},
		user: {
			plan: () => r("/user/plan"),
			activity: () => r("/user/activity"),
		},
	};
}

/**
 * useApi — React hook that provides an authenticated API client.
 * The client fetches a fresh Clerk token on every request, so the
 * JWT is never stale even if the user sits on the page for a while.
 * Returns { api, ready }.
 */
export function useApi() {
	const { getToken, isLoaded } = useAuth();
	const [api, setApi] = useState(null);

	useEffect(() => {
		if (!isLoaded) return;
		// Pass the getToken function itself — tokens are fetched per-call
		setApi(createApiClient(getToken));
	}, [isLoaded, getToken]);

	return { api, ready: !!api };
}

/**
 * useFetch — hook that fetches data from an API endpoint on mount.
 * Returns { data, loading, error, refetch }.
 */
export function useFetch(fetchFn, deps = []) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const execute = useCallback(async () => {
		if (!fetchFn) return;
		setLoading(true);
		setError(null);
		try {
			const result = await fetchFn();
			setData(result);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, deps);

	useEffect(() => {
		execute();
	}, [execute]);

	return { data, loading, error, refetch: execute };
}
