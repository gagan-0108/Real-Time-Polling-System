/**
 * Time utilities shared across modules.
 */

export function addHours(date, hours) {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function getBillingPeriodEnd(date = new Date()) {
	const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
	return end.toISOString();
}
