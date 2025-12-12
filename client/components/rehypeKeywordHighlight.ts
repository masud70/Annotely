// // client/components/rehypeKeywordHighlight.ts
// import { StringToken, Token } from "@/types";
// import type { Root, Element, Text, Node } from "hast";

// const SKIP_TAGS = new Set(["kbd", "samp"]);
// const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// const LETTER = "[A-Za-z0-9]";

// function isStringToken(t: Token): t is StringToken {
// 	return typeof (t as any).pattern === "string";
// }

// function compile(token: Token): { rx: RegExp; color: string } {
// 	if (!isStringToken(token)) {
// 		const baseFlags = token.pattern.flags.replace(/g/g, "");
// 		const flags =
// 			(token.flags ?? baseFlags) + (baseFlags.includes("g") ? "" : "g");
// 		return {
// 			rx: new RegExp(token.pattern.source, flags),
// 			color: token.color,
// 		};
// 	} else {
// 		const { pattern, mode = "literal" } = token;
// 		const escaped = esc(pattern);
// 		const body =
// 			mode === "word"
// 				? `(?:^|[^${LETTER.slice(1, -1)}])(${escaped})(?!${LETTER})`
// 				: escaped;
// 		const base = token.flags ?? "gi";
// 		const flags = base.includes("g") ? base : base + "g";
// 		return { rx: new RegExp(body, flags), color: token.color };
// 	}
// }

// function splitWithMarks(
// 	text: string,
// 	rules: { rx: RegExp; color: string }[]
// ): Node[] {
// 	if (!text || rules.length === 0)
// 		return [{ type: "text", value: text } as Text];

// 	type Seg = { start: number; end: number; color: string };
// 	const segs: Seg[] = [];

// 	for (const { rx, color } of rules) {
// 		for (const m of text.matchAll(rx) as any) {
// 			const fullIndex = m.index ?? 0;
// 			const inner = m[1] ?? m[0]; // if we used word-boundary wrapper, inner is in m[1]
// 			if (!inner) continue;

// 			// Find where the inner token starts within the whole match
// 			const innerOffset =
// 				m[1] != null ? (m[0] as string).indexOf(m[1] as string) : 0;

// 			const start = fullIndex + innerOffset;
// 			const end = start + (inner as string).length;
// 			segs.push({ start, end, color });
// 		}
// 	}
// 	if (segs.length === 0) return [{ type: "text", value: text } as Text];

// 	segs.sort(
// 		(a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start
// 	);
// 	const chosen: Seg[] = [];
// 	for (const s of segs) {
// 		if (chosen.every((c) => s.end <= c.start || s.start >= c.end))
// 			chosen.push(s);
// 	}
// 	chosen.sort((a, b) => a.start - b.start);

// 	const out: Node[] = [];
// 	let cur = 0;
// 	for (const s of chosen) {
// 		if (s.start > cur)
// 			out.push({ type: "text", value: text.slice(cur, s.start) } as Text);
// 		out.push({
// 			type: "element",
// 			tagName: "mark",
// 			properties: {
// 				style: `background:${s.color};border-radius:3px;padding:0 1px`,
// 			},
// 			children: [{ type: "text", value: text.slice(s.start, s.end) }],
// 		} as Element);
// 		cur = s.end;
// 	}
// 	if (cur < text.length)
// 		out.push({ type: "text", value: text.slice(cur) } as Text);
// 	return out;
// }

// function isText(n: Node): n is Text {
// 	return n.type === "text";
// }

// function walk(
// 	node: Node,
// 	rules: { rx: RegExp; color: string }[],
// 	inSkip = false
// ) {
// 	if (!("children" in node) || !Array.isArray((node as any).children)) return;

// 	const el = node as Element;
// 	const nowSkip =
// 		inSkip || (el.type === "element" && SKIP_TAGS.has((el as any).tagName));

// 	const children = el.children;
// 	for (let i = 0; i < children.length; i++) {
// 		const c = children[i];
// 		if (isText(c) && !nowSkip) {
// 			const replaced = splitWithMarks(c.value, rules);
// 			if (replaced.length !== 1 || !isText(replaced[0])) {
// 				// replace this text node with the marked fragments
// 				children.splice(i, 1, ...replaced);
// 				i += replaced.length - 1;
// 				continue;
// 			}
// 		}
// 		walk(c, rules, nowSkip);
// 	}
// }

// /** Factory: pass tokens to get a rehype plugin */
// export function rehypeKeywordHighlight(tokens: Token[]) {
// 	const rules = tokens.map(compile);
// 	return function attacher() {
// 		return function transformer(tree: Root) {
// 			if (!rules.length) return;
// 			// console.log("Rehype keyword highlight rules:", rules);
// 			walk(tree as unknown as Node, rules, false);
// 		};
// 	};
// }


// client/components/rehypeKeywordHighlight.ts
import { StringToken, Token } from "@/types";
import type { Root, Element, Text, Node, ElementContent, Parent } from "hast";

const SKIP_TAGS = new Set(["kbd", "samp"]);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const LETTER = "[A-Za-z0-9]";

function isStringToken(t: Token): t is StringToken {
  return typeof (t as any).pattern === "string";
}

function compile(token: Token): { rx: RegExp; color: string } {
  if (!isStringToken(token)) {
    const baseFlags = token.pattern.flags.replace(/g/g, "");
    const flags = (token.flags ?? baseFlags) + (baseFlags.includes("g") ? "" : "g");
    return { rx: new RegExp(token.pattern.source, flags), color: token.color };
  } else {
    const { pattern, mode = "literal" } = token;
    const escaped = esc(pattern);
    const body =
      mode === "word"
        ? `(?:^|[^${LETTER.slice(1, -1)}])(${escaped})(?!${LETTER})`
        : escaped;
    const base = token.flags ?? "gi";
    const flags = base.includes("g") ? base : base + "g";
    return { rx: new RegExp(body, flags), color: token.color };
  }
}

// ✅ return ElementContent[] (narrow enough to splice into children)
function splitWithMarks(
  text: string,
  rules: { rx: RegExp; color: string }[]
): ElementContent[] {
  if (!text || rules.length === 0) return [{ type: "text", value: text }];

  type Seg = { start: number; end: number; color: string };
  const segs: Seg[] = [];

  for (const { rx, color } of rules) {
    for (const m of text.matchAll(rx) as any) {
      const fullIndex = m.index ?? 0;
      const inner = m[1] ?? m[0];
      if (!inner) continue;

      const innerOffset = m[1] != null ? (m[0] as string).indexOf(m[1] as string) : 0;
      const start = fullIndex + innerOffset;
      const end = start + (inner as string).length;
      segs.push({ start, end, color });
    }
  }
  if (segs.length === 0) return [{ type: "text", value: text }];

  segs.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const chosen: Seg[] = [];
  for (const s of segs) {
    if (chosen.every((c) => s.end <= c.start || s.start >= c.end)) chosen.push(s);
  }
  chosen.sort((a, b) => a.start - b.start);

  const out: ElementContent[] = [];
  let cur = 0;

  for (const s of chosen) {
    if (s.start > cur) out.push({ type: "text", value: text.slice(cur, s.start) });

    out.push({
      type: "element",
      tagName: "mark",
      properties: { style: `background:${s.color};border-radius:3px;padding:0 1px` },
      children: [{ type: "text", value: text.slice(s.start, s.end) }],
    } as Element);

    cur = s.end;
  }

  if (cur < text.length) out.push({ type: "text", value: text.slice(cur) });
  return out;
}

function isText(n: ElementContent | Node): n is Text {
  return n.type === "text";
}

function walk(
  node: Node,
  rules: { rx: RegExp; color: string }[],
  inSkip = false
) {
  if (!("children" in node) || !Array.isArray((node as any).children)) return;

  const parent = node as Parent;
  const el = node as Element;

  const nowSkip =
    inSkip || (el.type === "element" && SKIP_TAGS.has((el as any).tagName));

  const children = parent.children as ElementContent[];

  for (let i = 0; i < children.length; i++) {
    const c = children[i];

    if (isText(c) && !nowSkip) {
      const replaced = splitWithMarks(c.value, rules);
      if (replaced.length !== 1 || replaced[0].type !== "text") {
        children.splice(i, 1, ...replaced); // ✅ now types match
        i += replaced.length - 1;
        continue;
      }
    }

    walk(c as unknown as Node, rules, nowSkip);
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
