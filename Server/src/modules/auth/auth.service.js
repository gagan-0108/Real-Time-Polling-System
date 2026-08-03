import { users } from "./auth.schema.js";

/**
 * AuthService — handles user record creation and lookups.
 * Extracted from the old auth middleware to separate concerns.
 */
export class AuthService {
	constructor(db) {
		this.db = db;
	}

	/**
	 * Extract email from Clerk session claims.
	 */
	getEmailFromClaims(claims, userId) {
		if (!claims) return `${userId}@no-email.local`;

		const direct = claims.email || claims.email_address || claims.primary_email_address;
		if (typeof direct === "string" && direct.length > 0) return direct;

		const list = claims.email_addresses;
		if (Array.isArray(list) && list.length > 0) {
			const first = list[0];
			if (typeof first === "string") return first;
			if (first && typeof first.email_address === "string") return first.email_address;
		}

		return `${userId}@no-email.local`;
	}

	/**
	 * Extract name from Clerk session claims.
	 */
	getNameFromClaims(claims) {
		if (!claims) return null;

		const name = claims.name;
		if (typeof name === "string" && name.length > 0) return name;

		const first = claims.first_name || claims.given_name;
		const last = claims.last_name || claims.family_name;
		if (first || last) return `${first || ""} ${last || ""}`.trim();

		return null;
	}

	/**
	 * Ensure a user record exists in the DB for the given Clerk user.
	 * Creates one if missing (upsert-like idempotent operation).
	 */
	async ensureUserRecord(userId, claims) {
		const email = this.getEmailFromClaims(claims, userId);
		const name = this.getNameFromClaims(claims);
		await this.db
			.insert(users)
			.values({ id: userId, email, name })
			.onConflictDoNothing({ target: users.id });
	}
}
