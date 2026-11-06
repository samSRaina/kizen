export interface FormattedDuration {
	digital: string; // "00:01:45"
	human: string; // "10s", "1m 45s", "2h 15m"
	hoursDecimal: string; // "0.03h", "2.25h"
}

/**
 * Format total seconds into human, digital, and decimal representations.
 */
export function formatSeconds(
	totalSeconds: number | null | undefined,
): FormattedDuration {
	const s = Math.max(0, Math.floor(totalSeconds ?? 0));
	const hours = Math.floor(s / 3600);
	const minutes = Math.floor((s % 3600) / 60);
	const seconds = s % 60;

	const digital = [
		String(hours).padStart(2, "0"),
		String(minutes).padStart(2, "0"),
		String(seconds).padStart(2, "0"),
	].join(":");

	let human = "";
	if (hours > 0) {
		human = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
	} else if (minutes > 0) {
		human = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
	} else {
		human = `${seconds}s`;
	}

	const hoursDecimal = `${(s / 3600).toFixed(2)}h`;

	return { digital, human, hoursDecimal };
}
