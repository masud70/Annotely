"use client";
import MarkdownViewer from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "@/components/ui/icons/akar-icons-play";
import useLabel from "@/hooks/useLabel";
import { useParams } from "next/navigation";
import { ExportDataset } from "@/components/ExportDataset";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, LucideHighlighter, SaveIcon } from "lucide-react";

const LabelDataset = () => {
	const { id } = useParams<{ id: string }>();
	const [open, setOpen] = useState(false);
	const [highlight, setHighlight] = useState<boolean>(true);
	const selectedItemRef = useRef<HTMLDivElement | null>(null);
	const {
		dataset,
		rows,
		stats,
		currentIndex,
		setCurrentIndex,
		keys,
		updateLabel,
		tokens,
	} = useLabel(id);

	useEffect(() => {
		selectedItemRef.current?.scrollIntoView({
			block: "nearest",
			behavior: "smooth",
		});
	}, [currentIndex, keys.length]);

	return (
		<div className="w-full flex h-full">
			<div className="min-w-[150px] shrink-0 h-full bg-gray-600 flex flex-col">
				<div className="bg-gray-800 w-full items-center flex justify-center min-h-[40px] max-h-[40px]">
					Key Column
				</div>
				{/* Values for key column */}
				<div className="overflow-y-auto">
					{keys.map((key, index) => (
						<div
							ref={
								index === currentIndex ? selectedItemRef : null
							}
							onClick={() => setCurrentIndex(index)}
							key={index}
							className={`w-full text-center border-y p-2 cursor-pointer duration-300 hover:bg-gray-500 ${
								index === currentIndex ? "bg-gray-400" : ""
							}`}
						>
							{key}
						</div>
					))}
				</div>
			</div>
			<div className="flex-1 min-w-0 bg-gray-700 isolate">
				<div className="w-full bg-gray-800 h-[40px] items-center flex justify-between px-2 space-x-2 relative z-50">
					<div className="min-w-[80px] flex gap-1">
						Row:{" "}
						<p className="bg-gray-700 px-1 rounded-md">{`${
							currentIndex + 1
						}/${keys.length}`}</p>
					</div>
					<div className="flex space-x-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
						{stats.map((s, id) => (
							<div
								key={id}
								className="flex space-x-1 items-center justify-center bg-gray-500/20 rounded px-1.5"
							>
								<div
									className="rounded-full w-3 h-3"
									style={{ backgroundColor: s.color }}
								/>
								<div className="mb-0.5">{s.count}</div>
							</div>
						))}
					</div>
					<div className="space-x-2 justify-center flex">
						<button
							onClick={() => setHighlight((p) => !p)}
							className="shrink-0 cursor-pointer flex items-center space-x-1 hover:bg-gray-600 bg-gray-600/50 rounded-md px-2 py-0.5 duration-400"
						>
							<Checkbox checked={highlight} />
							<p className="hidden md:block">Highlight</p>
							<LucideHighlighter size={20} />
						</button>
						<button
							onClick={() => setOpen(true)}
							className="shrink-0 flex gap-1 items-center cursor-pointer hover:bg-gray-600 bg-gray-600/50 rounded-md px-2 py-0.5 duration-400 "
						>
							<p className="hidden md:block">Export file</p>
							<SaveIcon scale={0.5} size={20} />
						</button>
						<Link
							href={"/"}
							className="shrink-0 gap-1 flex items-center hover:bg-gray-600 bg-gray-600/50 rounded-md px-2 py-0.5 duration-400"
						>
							<p className="hidden md:block">Exit</p>
							<ExternalLink size={20} />
						</Link>
					</div>
				</div>
				<div className="w-auto h-[calc(100vh-190px)] overflow-y-auto p-1 relative z-0">
					<div className="grid grid-cols-[auto_1fr] w-full gap-y-0.5">
						{keys.length > 0 && dataset?.selectedColumns
							? Object.keys(rows[keys[currentIndex]] ?? {}).map(
									(k) =>
										[
											...dataset?.selectedColumns,
											"_label",
										].includes(k) ? (
											<>
												<div className="min-w-[60px] shrink-0 max-w-[120px] lg:max-w-[150px] bg-gray-500 p-1">
													{k}
												</div>
												<MarkdownViewer
													tokens={tokens}
													highlight={highlight}
													markdown={
														rows[
															keys[currentIndex]
														][k] ?? ""
													}
												/>
											</>
										) : null
							  )
							: null}
					</div>
				</div>
				<div className="h-[100px] p-2 items-center bg-gray-800 flex flex-col">
					<div className="flex-1 items-center justify-center space-x-2 overflow-x-auto">
						{dataset?.labels.map((l, idx) => (
							<Button
								key={idx}
								className="border py-1 px-4 cursor-pointer"
								variant={"ghost"}
								style={{ backgroundColor: l.color }}
								onClick={() =>
									updateLabel({
										rowId: rows[keys[currentIndex]][
											"rowId"
										],
										label: l.name,
									})
								}
							>
								{l.name}
							</Button>
						))}
					</div>
					<div className="flex items-center justify-center space-x-2 overflow-x-auto mt-2">
						<Button
							className="border p-2 space-x-[-10px] cursor-pointer"
							variant={"ghost"}
							onClick={() => setCurrentIndex(0)}
						>
							<PlayIcon className="rotate-180" />
							<PlayIcon className="rotate-180" />
						</Button>
						<Button
							className="border p-2 cursor-pointer"
							variant={"ghost"}
							onClick={() =>
								setCurrentIndex((p) => Math.max(p - 1, 0))
							}
						>
							<PlayIcon className="rotate-180" />
						</Button>
						<Button
							className="border p-2 cursor-pointer"
							variant={"ghost"}
							onClick={() =>
								setCurrentIndex((p) =>
									Math.min(p + 1, keys.length - 1)
								)
							}
						>
							<PlayIcon />
						</Button>
						<Button
							className="border p-2 space-x-[-10px] cursor-pointer"
							variant={"ghost"}
							onClick={() => setCurrentIndex(keys.length - 1)}
						>
							<PlayIcon />
							<PlayIcon />
						</Button>
					</div>
				</div>
			</div>
			<ExportDataset
				fileId={Number(id)}
				allColumns={dataset?.columns || []}
				suggestedRange={{
					start: 0,
					end: Object.keys(rows).length,
				}}
				setOpen={setOpen}
				open={open}
			/>
		</div>
	);
};

export default LabelDataset;
