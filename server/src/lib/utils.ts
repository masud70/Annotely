// utils.ts (CJS)
export {}; // ✅ force module scope

function chunk(arr: any[], size = 1000) {
	const out: any[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

const esc = (v: unknown) => {
	const s = v == null ? "" : String(v);
	return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

module.exports = { chunk, esc };
