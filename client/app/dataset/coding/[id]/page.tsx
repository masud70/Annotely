"use client";
import MarkdownViewer from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "@/components/ui/icons/akar-icons-play";
import { useParams } from "next/navigation";
import { ExportDataset } from "@/components/ExportDataset";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	ExternalLink,
	Fullscreen,
	LucideHighlighter,
	PlusCircleIcon,
	SaveIcon,
} from "lucide-react";
import { noScrollbar, scrollbar } from "@/lib/utils";
import useCoding from "@/hooks/useCoding";
import { CodeInput } from "@/components/CodeInput";
import Loader from "@/components/ui/Loader";
import { RSS } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const CodeDataset = () => {
	const { id } = useParams<{ id: string }>();
	const [open, setOpen] = useState(false);
	const [highlight, setHighlight] = useState<boolean>(true);
	const selectedItemRef = useRef<HTMLDivElement | null>(null);
	const boxRef = useRef<HTMLDivElement | null>(null);
	const [noteOpen, setNoteOpen] = useState(false);
	const {
		dataset,
		rows,
		// stats,
		currentIndex,
		setCurrentIndex,
		keys,
		tokens,
		isLoading,
		updateCode,
		updateTheme,
		themes,
		codes,
		stayOnPage,
		setStayOnPage,
		notes,
		setNotes,
		updateNotes,
	} = useCoding(id);

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

	if (isLoading) return <Loader global show />;

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

				{/* div1 which must be h-full */}
				<div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden min-w-0 bg-transparent">
					{/* div2 */}
					<div className="w-full bg-transparent h-[40px] items-center flex justify-between px-2 space-x-2 border-y-2 border-gray-400">
						<div
							className={
								"min-w-fit overflow-x-auto flex gap-1" +
								noScrollbar
							}
						>
							Row:{" "}
							<p className="bg-gray-400 dark:bg-gray-700 pr-1 rounded-md flex min-w-fit">
								<input
									className="bg-background/25 rounded-md mr-1 focus:outline-2"
									defaultValue={currentIndex + 1}
									style={{
										width: `${Math.max(
											String(currentIndex).length + 1,
											3
										)}ch`,
										textAlign: "center",
									}}
									onKeyUp={(e) => {
										if (e.key === "Enter") {
											const num = Number(
												e.currentTarget.value
											);

											setCurrentIndex(
												Math.min(
													Math.max(num - 1, 0),
													keys.length - 1
												)
											);
										}
									}}
								/>
								<span className="min-w-fit">{`/ ${String(
									keys.length
								)}`}</span>
							</p>
						</div>
						{/* <div className="flex space-x-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
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
						</div> */}
						<div className="space-x-2 justify-center flex">
							<div
								onClick={() => setHighlight((p) => !p)}
								className="shrink-0 cursor-pointer flex items-center space-x-1 hover:bg-gray-600 bg-gray-600/50 rounded-md px-2 py-0.5 duration-400"
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

					{/* div3 */}
					<div
						className={
							"w-auto flex-1 min-h-0 overflow-y-auto px-1" +
							scrollbar
						}
					>
						<div
							className={
								"grid grid-cols-[auto_1fr] w-full gap-y-0.5"
							}
						>
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
											"_label",
											"_code",
											"_theme",
											"_note",
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

					{/* div4 */}
					<div className="p-1 items-center border-t-2 border-gray-400 flex flex-col gap-1 relative">
						<Dialog open={noteOpen} onOpenChange={setNoteOpen}>
							<DialogTrigger asChild>
								<button className="absolute bg-gray-900/90 rounded-full cursor-pointer p-1 right-[10px] top-[-65px]">
									<PlusCircleIcon size={45} />
								</button>
							</DialogTrigger>
							<DialogContent className="w-[100%] lg:w-[60%]">
								<DialogHeader>
									<DialogTitle className="text-center">
										Add Note
									</DialogTitle>
									<DialogDescription className="text-center">
										Key column value:{" "}
										<span className="font-bold">
											{keys[currentIndex]}
										</span>
									</DialogDescription>
								</DialogHeader>
								<div className="flex items-center gap-2">
									<div className="grid flex-1 gap-2">
										<Textarea
											value={notes}
											onChange={(e) =>
												setNotes(e.target.value)
											}
											placeholder="Write your note here..."
											className={
												"max-h-[200px]" + scrollbar
											}
											onKeyUp={(e) => {
												if (e.key === "Escape") {
													setNoteOpen(false);
												} else if (
													e.key === "Enter" &&
													(e.ctrlKey || e.metaKey)
												) {
													updateNotes({
														rowId: String(
															rows[
																keys[
																	currentIndex
																]
															]?.id
														),
														note: notes,
													});
													setNotes("");
													setNoteOpen(false);
												}
											}}
										/>
									</div>
								</div>
								<DialogFooter className="sm:justify-end">
									<DialogClose asChild>
										<Button
											type="button"
											variant="secondary"
										>
											Close
										</Button>
									</DialogClose>
									<Button
										onClick={async () => {
											await updateNotes({
												rowId: String(
													rows[keys[currentIndex]]?.id
												),
												note: notes,
											});
											setNotes("");
											setNoteOpen(false);
										}}
										type="submit"
										title="Ctrl+Enter"
									>
										Save Note
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 lg:flex-row items-center justify-center gap-x-2 w-full lg:w-[70%]">
							<CodeInput
								placeholder="Add new code..."
								key={`${rows[keys[currentIndex]]?.id}:${
									rows[keys[currentIndex]]?.code ?? "code"
								}`}
								defaultValues={
									rows[keys[currentIndex]]?.code ?? ""
								}
								rowId={String(rows[keys[currentIndex]]?.id)}
								onSave={updateCode}
								suggestions={codes}
							/>
							<CodeInput
								placeholder="Add new theme..."
								key={`${rows[keys[currentIndex]]?.id}:${
									rows[keys[currentIndex]]?.theme ?? "theme"
								}`}
								defaultValues={
									rows[keys[currentIndex]]?.theme ?? ""
								}
								rowId={String(rows[keys[currentIndex]]?.id)}
								onSave={updateTheme}
								suggestions={themes}
							/>
						</div>
						<div className="flex items-center justify-center space-x-2 overflow-x-auto">
							<Button
								className="border-2 border-gray-400 p-2 space-x-[-10px] cursor-pointer"
								variant={"ghost"}
								onClick={() => setCurrentIndex(0)}
								title="First"
							>
								<PlayIcon className="rotate-180" />
								<PlayIcon className="rotate-180" />
							</Button>
							<Button
								className="border-2 border-gray-400 p-2 cursor-pointer"
								variant={"ghost"}
								title="Previous"
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
								title="Next"
								onClick={() =>
									setCurrentIndex((p) =>
										Math.min(p + 1, keys.length - 1)
									)
								}
							>
								<PlayIcon />
							</Button>
							<Button
								title="Last"
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

export default CodeDataset;
