export function chunk<T>(arr: T[], size = 1000): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

export const esc = (v: unknown) => {
	const s = v == null ? "" : String(v);
	return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
