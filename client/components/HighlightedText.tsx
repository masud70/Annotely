// components/HighlightedText.tsx
"use client";
import React, { useEffect, useMemo } from "react";

type RegexToken = { pattern: RegExp; color: string; flags?: string };
type StringToken = {
	pattern: string;
	color: string;
	mode?: "literal" | "word";
	flags?: string;
};
export type Token = StringToken | RegexToken;

function isStringToken(t: Token): t is StringToken {
	return typeof (t as any).pattern === "string";
}

type Segment = { start: number; end: number; color: string };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// “word char” = only letters/digits (underscore is a separator)
const LETTER = "[A-Za-z0-9]";

function compile(token: Token): RegExp {
	if (!isStringToken(token)) {
		// ensure global flag
		const baseFlags = token.pattern.flags.replace(/g/g, "");
		const flags =
			(token.flags ?? baseFlags) + (baseFlags.includes("g") ? "" : "g");
		return new RegExp(token.pattern.source, flags);
	} else {
		const { pattern, mode = "literal" } = token;
		const escaped = esc(pattern);

		// Fallback-friendly “word” boundary using a capturing group
		// (?:^|[^A-Za-z0-9]) ( <token> ) (?![A-Za-z0-9])
		const body =
			mode === "word"
				? `(?:^|[^${LETTER.slice(1, -1)}])(${escaped})(?!${LETTER})`
				: escaped;

		const base = token.flags ?? "gi";
		const flags = base.includes("g") ? base : base + "g";
		return new RegExp(body, flags);
	}
}

function collectSegments(text: string, tokens: Token[]): Segment[] {
	const segs: Segment[] = [];
	tokens.forEach((t) => {
		const rx = compile(t);
		for (const m of text.matchAll(rx) as any) {
			const fullIndex = m.index ?? 0;

			// If we used the fallback boundary, the inner token is in m[1].
			// For literal/regex tokens without our group, use m[0].
			const inner = m[1] ?? m[0];
			if (!inner) continue;

			const start =
				m[1] != null
					? fullIndex + (m[0] as string).indexOf(m[1] as string)
					: fullIndex;
			const end = start + (inner as string).length;

			segs.push({ start, end, color: (t as any).color });
		}
	});

	return segs;
}

// Resolve overlaps: prefer longer spans, then earlier start
function resolveOverlaps(segs: Segment[]): Segment[] {
	const chosen: Segment[] = [];
	const used: boolean[] = [];
	segs.sort(
		(a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start
	).forEach((s) => {
		// check overlap with chosen
		for (const c of chosen) {
			if (!(s.end <= c.start || s.start >= c.end)) return; // overlaps → skip
		}
		chosen.push(s);
	});
	// sort by position
	return chosen.sort((a, b) => a.start - b.start);
}

export default function HighlightedText({
	text,
	tokens,
	className,
}: {
	text: string;
	tokens: Token[];
	className?: string;
}) {
	const s = useMemo(
		() => resolveOverlaps(collectSegments(text, tokens)),
		[text, tokens]
	);

	useEffect(() => {
		console.table(s);
	}, [s]);

	if (!text || !tokens?.length)
		return <span className={className}>{text}</span>;

	const segs = resolveOverlaps(collectSegments(text, tokens));

	const parts: React.ReactNode[] = [];
	let cursor = 0;
	segs.forEach((s, i) => {
		if (s.start > cursor)
			parts.push(
				<span key={`t-${i}-pre`}>{text.slice(cursor, s.start)}</span>
			);
		parts.push(
			<mark
				key={`t-${i}`}
				style={{
					backgroundColor: "red",
					padding: "0 1px",
					borderRadius: 3,
				}}
				className="text-black"
			>
				{text.slice(s.start, s.end)}
			</mark>
		);
		cursor = s.end;
	});
	if (cursor < text.length)
		parts.push(<span key="tail">{text.slice(cursor)}</span>);

	return <span className={className}>{parts}</span>;
}
