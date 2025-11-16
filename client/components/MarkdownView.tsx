"use client";
import "highlight.js/styles/github-dark.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { rehypeKeywordHighlight } from "@/components/rehypeKeywordHighlight";
import { Token } from "@/types";

export default function MarkdownViewer({
	markdown,
	tokens = [{ pattern: "", color: "" }],
}: {
	markdown: string;
	tokens?: Token[];
}) {
	return (
		<div className="bg-gray-900 flex-1 min-w-0 dark:prose-invert px-2 whitespace-normal break-all rounded-r-md">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[
					rehypeRaw,
					rehypeSanitize,
					rehypeHighlight,
					rehypeKeywordHighlight(tokens),
				]}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	);
}
