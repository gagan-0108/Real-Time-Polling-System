/**
 * env.js — centralized environment configuration.
 * Import `config` anywhere instead of scattering process.env reads.
 */

function parseNumber(val, fallback) {
	const n = Number(val);
	return Number.isFinite(n) ? n : fallback;
}

function parseCorsOrigins(raw) {
	if (!raw || raw === "*") return "*";
	return raw.split(",").map((v) => v.trim()).filter(Boolean);
}

function parseEmailList(raw) {
	if (!raw) return new Set();
	return new Set(raw.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean));
}

export const config = Object.freeze({
	port: parseNumber(process.env.PORT, 5000),
	databaseUrl: process.env.DATABASE_URL,
	corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN),
	unlimitedEmails: parseEmailList(process.env.UNLIMITED_EMAILS),

	planLimits: {
		auth: parseNumber(process.env.PLAN_AUTH_LIMIT, 5),
		anon: parseNumber(process.env.PLAN_ANON_LIMIT, 2),
		responses: parseNumber(process.env.PLAN_RESPONSES_LIMIT, 100),
	},
});
