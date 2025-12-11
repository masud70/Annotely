"use client";
// import "highlight.js/styles/github-dark.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { rehypeKeywordHighlight } from "@/components/rehypeKeywordHighlight";
import { Token } from "@/types";

export default function MarkdownViewer({
	markdown,
	tokens = [],
	highlight = true,
}: {
	markdown: string;
	tokens?: Token[];
	highlight?: boolean;
}) {
	return (
		<article className="dark:bg-gray-900/80 flex-1 min-w-0 dark:prose-invert px-2 whitespace-normal break-all markdown-body bg-gray-200">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[
					rehypeRaw,
					rehypeSanitize,
					rehypeHighlight,
					highlight ? rehypeKeywordHighlight(tokens) : () => {},
				]}
			>
				{markdown}
			</ReactMarkdown>
		</article>
	);
}
