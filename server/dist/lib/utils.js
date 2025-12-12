"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function chunk(arr, size = 1000) {
    const out = [];
    for (let i = 0; i < arr.length; i += size)
        out.push(arr.slice(i, i + size));
    return out;
}
const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
module.exports = { chunk, esc };
//# sourceMappingURL=utils.js.map