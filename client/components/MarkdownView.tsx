"use client";
// import "highlight.js/styles/github-dark.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { rehypeKeywordHighlight } from "@/components/rehypeKeywordHighlight";
import { Token } from "@/types";
import { CopyCheck, LucideCopy } from "lucide-react";
import { useState } from "react";

export default function MarkdownViewer({
	markdown,
	tokens = [],
	highlight = true,
}: {
	markdown: string;
	tokens?: Token[];
	highlight?: boolean;
}) {
	const [copied, setCopied] = useState(false);
	const handleCopy = async () => {
		await navigator.clipboard.writeText(markdown);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<article className="dark:bg-gray-900/80 flex-1 min-w-0 dark:prose-invert px-2 whitespace-normal break-all markdown-body bg-gray-200 relative">
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
			{markdown.length > 0 && (
				<div
					onClick={handleCopy}
					className="text-white opacity-20 hover:opacity-100 flex items-center gap-1 bg-gray-500/20 hover:bg-gray-500/80 px-2 rounded-md absolute top-1 right-1 cursor-pointer"
				>
					{copied ? (
						<CopyCheck size={15} />
					) : (
						<LucideCopy size={15} />
					)}
					<span>{copied ? "Copied" : "Copy"}</span>
				</div>
			)}
		</article>
	);
}
