// client/components/rehypeKeywordHighlight.ts
import { Token } from "@/types";
import type { Root, Element, Text, Node } from "hast";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function compile(token: Token): { rx: RegExp; color: string } {
	if (token.pattern instanceof RegExp) {
		const baseFlags = token.pattern.flags.replace(/g/g, "");
		const flags =
			(token.flags ?? baseFlags) + (baseFlags.includes("g") ? "" : "g");
		return {
			rx: new RegExp(token.pattern.source, flags),
			color: token.color,
		};
	} else {
		const { pattern, mode = "literal" } = token;
		const body = mode === "word" ? `\\b${esc(pattern)}\\b` : esc(pattern);
		const base = token.flags ?? "gi";
		const flags = base.includes("g") ? base : base + "g";
		return { rx: new RegExp(body, flags), color: token.color };
	}
}

function splitWithMarks(
	text: string,
	rules: { rx: RegExp; color: string }[]
): Node[] {
	if (!text || rules.length === 0)
		return [{ type: "text", value: text } as Text];

	// Collect all matches
	type Seg = { start: number; end: number; color: string };
	const segs: Seg[] = [];
	for (const { rx, color } of rules) {
		for (const m of text.matchAll(rx)) {
			const i = m.index ?? 0;
			const s = m[0] ?? "";
			if (!s) continue;
			segs.push({ start: i, end: i + s.length, color });
		}
	}
	if (segs.length === 0) return [{ type: "text", value: text }];

	// Resolve overlaps: prefer longer, then earlier start
	segs.sort(
		(a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start
	);
	const chosen: Seg[] = [];
	for (const s of segs) {
		if (chosen.every((c) => s.end <= c.start || s.start >= c.end))
			chosen.push(s);
	}
	chosen.sort((a, b) => a.start - b.start);

	// Rebuild nodes
	const out: Node[] = [];
	let cur = 0;
	for (const s of chosen) {
		if (s.start > cur)
			out.push({ type: "text", value: text.slice(cur, s.start) } as Text);
		out.push({
			type: "element",
			tagName: "mark",
			properties: {
				style: `background:${s.color};border-radius:3px;padding:0 2px`,
			},
			children: [{ type: "text", value: text.slice(s.start, s.end) }],
		} as Element);
		cur = s.end;
	}
	if (cur < text.length)
		out.push({ type: "text", value: text.slice(cur) } as Text);
	return out;
}

function isText(n: Node): n is Text {
	return n.type === "text";
}

const SKIP_TAGS = new Set(["code", "pre", "kbd", "samp"]);

function walk(
	node: Node,
	rules: { rx: RegExp; color: string }[],
	inSkip = false
) {
	if (!("children" in node) || !Array.isArray((node as any).children)) return;

	const el = node as Element;
	const nowSkip =
		inSkip || (el.type === "element" && SKIP_TAGS.has((el as any).tagName));

	const children = el.children;
	for (let i = 0; i < children.length; i++) {
		const c = children[i];
		if (isText(c) && !nowSkip) {
			const replaced = splitWithMarks(c.value, rules);
			if (replaced.length !== 1 || !isText(replaced[0])) {
				// replace this text node with the marked fragments
				children.splice(i, 1, ...replaced);
				i += replaced.length - 1;
				continue;
			}
		}
		walk(c, rules, nowSkip);
	}
}

/** Factory: pass tokens to get a rehype plugin */
export function rehypeKeywordHighlight(tokens: Token[]) {
	const rules = tokens.map(compile);
	return function attacher() {
		return function transformer(tree: Root) {
			if (!rules.length) return;
			walk(tree as unknown as Node, rules, false);
		};
	};
}
