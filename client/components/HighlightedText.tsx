// components/HighlightedText.tsx
"use client";
import React from "react";

export type Token =
	| {
			pattern: string;
			color: string;
			mode?: "literal" | "word";
			flags?: string;
	  }
	| { pattern: RegExp; color: string; flags?: string }; // mode ignored for RegExp

type Segment = { start: number; end: number; color: string };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function compile(token: Token): RegExp {
	// Build pattern + flags, always add 'g' for scanning
	if (token.pattern instanceof RegExp) {
		const baseFlags = token.pattern.flags.replace(/g/g, "");
		const flags =
			(token.flags ?? baseFlags) + (baseFlags.includes("g") ? "" : "g");
		return new RegExp(token.pattern.source, flags);
	} else {
		const { pattern, mode = "literal" } = token;
		const body = mode === "word" ? `\\b${esc(pattern)}\\b` : esc(pattern); // literal/word
		const base = token.flags ?? "gi";
		const flags = base.includes("g") ? base : base + "g";
		return new RegExp(body, flags);
	}
}

function collectSegments(text: string, tokens: Token[]): Segment[] {
	const segs: Segment[] = [];
	tokens.forEach((t, idx) => {
		const rx = compile(t);
		for (const m of text.matchAll(rx)) {
			const i = m.index ?? 0;
			const seg = m[0] ?? "";
			if (!seg) continue;
			segs.push({ start: i, end: i + seg.length, color: t.color });
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
					backgroundColor: s.color,
					padding: "0 2px",
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
