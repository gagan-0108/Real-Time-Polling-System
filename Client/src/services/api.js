// ─────────────────────────────────────────────────────────
//  api.js — centralized API client
//  Uses a token string for auth. For React components,
//  prefer the useApi() hook from hooks/useApi.js which
//  automatically injects the Clerk session token.
// ─────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

/** Generic fetch wrapper with auth token */
async function request(path, options = {}) {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		...options,
	});

	if (res.status === 204) return null;

	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: res.statusText }));
		throw new Error(err.message || "API error");
	}

	return res.json();
}

// ── POLLS ────────────────────────────────────────────────

export const pollsAPI = {
	/** GET /polls — list current user's polls */
	list: () => request("/polls"),

	/** GET /polls/:id — get single poll */
	get: (id) => request(`/polls/${id}`),

	/** POST /polls — create a new poll */
	create: (data) => request("/polls", { method: "POST", body: JSON.stringify(data) }),

	/** PATCH /polls/:id — update poll */
	update: (id, data) => request(`/polls/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

	/** DELETE /polls/:id — delete poll */
	delete: (id) => request(`/polls/${id}`, { method: "DELETE" }),

	/** POST /polls/:id/publish — publish results */
	publish: (id) => request(`/polls/${id}/publish`, { method: "POST" }),

	/** GET /polls/:id/public — get public poll (no auth required) */
	getPublic: (id) => request(`/polls/${id}/public`),
};

// ── RESPONSES ────────────────────────────────────────────

export const responsesAPI = {
	/** POST /polls/:id/responses — submit a response */
	submit: (pollId, answers) =>
		request(`/polls/${pollId}/responses`, { method: "POST", body: JSON.stringify({ answers }) }),

	/** GET /polls/:id/responses — list responses (poll owner only) */
	list: (pollId) => request(`/polls/${pollId}/responses`),
};

// ── ANALYTICS ────────────────────────────────────────────

export const analyticsAPI = {
	/** GET /analytics/overview — user's analytics summary */
	overview: () => request("/analytics/overview"),

	/** GET /analytics/polls/:id — per-poll analytics */
	pollAnalytics: (pollId) => request(`/analytics/polls/${pollId}`),

	/** GET /analytics/polls/:id/questions — per-question breakdown */
	questionAnalytics: (pollId) => request(`/analytics/polls/${pollId}/questions`),

	/** GET /analytics/trends — historical trends */
	trends: () => request("/analytics/trends"),
};

// ── USER / PLAN ──────────────────────────────────────────

export const userAPI = {
	/** GET /user/plan — current plan & usage */
	plan: () => request("/user/plan"),

	/** GET /user/activity — recent activity */
	activity: () => request("/user/activity"),
};
