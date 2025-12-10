"use client";
import MarkdownViewer from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "@/components/ui/icons/akar-icons-play";
import useLabel from "@/hooks/useLabel";
import { useParams } from "next/navigation";
import { ExportDataset } from "@/components/ExportDataset";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Fullscreen, LucideHighlighter, SaveIcon } from "lucide-react";
import { scrollbar } from "@/lib/utils";
import Loader from "@/components/ui/Loader";
import { RSS } from "@/types";

const LabelDataset = () => {
	const { id } = useParams<{ id: string }>();
	const [open, setOpen] = useState(false);
	const [highlight, setHighlight] = useState<boolean>(true);
	const selectedItemRef = useRef<HTMLDivElement | null>(null);
	const boxRef = useRef<HTMLDivElement | null>(null);
	const {
		dataset,
		rows,
		stats,
		currentIndex,
		setCurrentIndex,
		keys,
		updateLabel,
		tokens,
		isLoading,
		stayOnPage,
		setStayOnPage,
	} = useLabel(id);

	const toggleFullscreen = async () => {
		if (typeof document === "undefined") return;
		if (!document.fullscreenElement) {
			if (boxRef.current) {
				try {
					await boxRef.current.requestFullscreen();
				} catch (err) {
					console.error("Error attempting fullscreen:", err);
				}
			}
		} else {
			try {
				await document.exitFullscreen();
			} catch (err) {
				console.error("Error exiting fullscreen:", err);
			}
		}
	};

	useEffect(() => {
		selectedItemRef.current?.scrollIntoView({
			block: "nearest",
			behavior: "smooth",
		});
	}, [currentIndex, keys.length]);

	if (isLoading) return <Loader show global />;

	return (
		<>
			<Loader global show={isLoading} transparency={100} />
			<div
				ref={boxRef}
				className="w-full flex h-full bg-gray-300 dark:bg-gray-800"
			>
				<div className="min-w-[150px] shrink-0 h-full  flex flex-col">
					<div className="bg-transparent w-full items-center flex justify-center min-h-[40px] max-h-[40px] border-y-2 border-gray-400">
						Key Column
					</div>
					{/* Values for key column */}
					<div className={"overflow-y-auto" + scrollbar}>
						{keys.map((key, index) => (
							<div
								ref={
									index === currentIndex
										? selectedItemRef
										: null
								}
								onClick={() => setCurrentIndex(index)}
								key={index}
								className={`w-full text-center border-y border-gray-400 p-2 cursor-pointer duration-300 dark:hover:bg-gray-400 hover:bg-gray-500 ${
									index === currentIndex
										? "bg-gray-600 text-white dark:bg-gray-300 dark:text-black"
										: "bg-gray-200 dark:bg-gray-700"
								}`}
							>
								{key}
							</div>
						))}
					</div>
				</div>
				<div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-transparent">
					<div className="w-full bg-transparent h-[40px] items-center flex justify-between px-2 space-x-2 border-y-2 border-gray-400">
						<div className="min-w-[80px] flex gap-1">
							Row:{" "}
							<p className="bg-gray-400 dark:bg-gray-700 px-1 rounded-md">{`${
								currentIndex + 1
							}/${keys.length}`}</p>
						</div>
						<div className="flex space-x-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
							{stats.map((s, id) => (
								<div
									key={id}
									title={s.label}
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
							<div
								className="shrink-0 cursor-pointer flex items-center space-x-1 hover:bg-gray-600 bg-gray-600/50 rounded-md px-2 py-0.5 duration-400"
								onClick={() => setHighlight((p) => !p)}
							>
								<Checkbox checked={highlight} />
								<p className="hidden md:block">Highlight</p>
								<LucideHighlighter size={20} />
							</div>
							<button
								onClick={() => setOpen(true)}
								className="shrink-0 flex gap-1 items-center cursor-pointer hover:bg-gray-600 bg-gray-600/50 rounded-md px-2 py-0.5 duration-400 "
							>
								<p className="hidden md:block">Export file</p>
								<SaveIcon scale={0.5} size={20} />
							</button>
                            <button
								onClick={toggleFullscreen}
								className="shrink-0 flex gap-1 items-center cursor-pointer hover:bg-gray-600 bg-gray-600/50 rounded-md px-2 py-0.5 duration-400 "
							>
								<p className="hidden md:block">Full Screen</p>
								<Fullscreen scale={0.5} size={20} />
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
					<div
						className={
							"flex-1 min-h-0 w-auto overflow-y-auto px-1" +
							scrollbar
						}
					>
						<div className="grid grid-cols-[auto_1fr] w-full gap-y-0.5">
							{keys.length > 0 && dataset?.selectedColumns
								? (() => {
										const row = rows[keys[currentIndex]];
										if (!row) return null;

										const display: RSS = {
											...row.data,
											_label: row.label ?? "",
											_code: row.code ?? "",
											_theme: row.theme ?? "",
											_note: row.note ?? "",
										};

										// only render selected columns + extras
										const allowed = new Set([
											...dataset.selectedColumns,
										]);

										return Object.keys(display).map((k) =>
											allowed.has(k) ? (
												<React.Fragment key={k}>
													<div className="min-w-[60px] text-center shrink-0 max-w-[120px] lg:max-w-[150px] bg-gray-300 dark:bg-gray-700 p-1">
														{k}
													</div>
													<MarkdownViewer
														tokens={tokens}
														highlight={highlight}
														markdown={
															display[k] ?? ""
														}
													/>
												</React.Fragment>
											) : null
										);
								  })()
								: null}
						</div>
					</div>
					<div className="h-[100px] p-2 items-center border-t-2 border-gray-400 flex flex-col">
						<div className="flex-1 items-center justify-center space-x-2 overflow-x-auto">
							{dataset?.labels.map((l, idx) => (
								<Button
									key={idx}
									className="border-2 py-1 px-4 cursor-pointer"
									variant={"ghost"}
									style={{ backgroundColor: l.color }}
									onClick={() =>
										updateLabel({
											rowId:
												String(
													rows[keys[currentIndex]]?.id
												) ?? "",
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
								className="border-2 border-gray-400 p-2 space-x-[-10px] cursor-pointer"
								variant={"ghost"}
								onClick={() => setCurrentIndex(0)}
							>
								<PlayIcon className="rotate-180" />
								<PlayIcon className="rotate-180" />
							</Button>
							<Button
								className="border-2 border-gray-400 p-2 cursor-pointer"
								variant={"ghost"}
								onClick={() =>
									setCurrentIndex((p) => Math.max(p - 1, 0))
								}
							>
								<PlayIcon className="rotate-180" />
							</Button>
							<Button
								onClick={() => setStayOnPage((p) => !p)}
								className="border-2 border-gray-400 px-4 cursor-pointer text-xl"
								variant={stayOnPage ? "default" : "ghost"}
								title="Stay on page"
							>
								| |
							</Button>
							<Button
								className="border-2 border-gray-400 p-2 cursor-pointer"
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
								className="border-2 border-gray-400 p-2 space-x-[-10px] cursor-pointer"
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
		</>
	);
};

export default LabelDataset;
