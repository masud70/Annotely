import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const scrollbar =
	" scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-slate-600 scrollbar-track-slate-300 scrollbar-thin";
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatDate = (date: string) => {
	const dateObject = new Date(date);
	return dateObject.toLocaleString("en-US", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true, // For AM/PM format
	});
};

// Distinct colors via evenly spaced HSL hues
export function getColors(n: number): string[] {
	if (n <= 0) return [];
	const colors: string[] = [];
	const S = 0.65; // saturation
	const L = 0.55; // lightness

	for (let i = 0; i < n; i++) {
		const h = (i / n) * 360; // even hue steps
		colors.push(hslToHex(h, S, L));
	}
	return colors;
}

function hslToHex(h: number, s: number, l: number): string {
	// h [0..360), s/l [0..1]
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const hp = h / 60;
	const x = c * (1 - Math.abs((hp % 2) - 1));
	let r = 0,
		g = 0,
		b = 0;

	if (0 <= hp && hp < 1) [r, g, b] = [c, x, 0];
	else if (1 <= hp && hp < 2) [r, g, b] = [x, c, 0];
	else if (2 <= hp && hp < 3) [r, g, b] = [0, c, x];
	else if (3 <= hp && hp < 4) [r, g, b] = [0, x, c];
	else if (4 <= hp && hp < 5) [r, g, b] = [x, 0, c];
	else if (5 <= hp && hp < 6) [r, g, b] = [c, 0, x];

	const m = l - c / 2;
	const R = Math.round((r + m) * 255);
	const G = Math.round((g + m) * 255);
	const B = Math.round((b + m) * 255);

	return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}

function toHex(v: number): string {
	const h = v.toString(16).toUpperCase();
	return h.length === 1 ? "0" + h : h;
}
