"use client";
import MarkdownViewer from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "@/components/ui/icons/akar-icons-play";
import useLabel from "@/hooks/useLabel";
import { useParams } from "next/navigation";
import { ExportDataset } from "@/components/ExportDataset";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const LabelDataset = () => {
	const { id } = useParams<{ id: string }>();
	const [open, setOpen] = useState(false);
	const selectedItemRef = useRef<HTMLDivElement | null>(null);
	const {
		dataset,
		rows,
		currentIndex,
		setCurrentIndex,
		keys,
		updateLabel,
		tokens,
	} = useLabel(id);

	useEffect(() => {
		// Smoothly ensure the selected item is visible
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
			<div className="flex-1 min-w-0 bg-gray-700">
				<div className="w-full bg-gray-800 min-h-[40px] max-h-[40px] items-center flex justify-between px-2">
					<div>Row: {`${currentIndex + 1}/${keys.length}`}</div>
					<div className="flex space-x-4">
						<div>Highlight</div>
						<button onClick={() => setOpen(true)}>
							Export file
						</button>
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
						<Link href={"/"}>Exit</Link>
					</div>
				</div>
				<div className="w-auto h-[calc(100vh-190px)] overflow-y-auto p-1">
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
		</div>
	);
};

export default LabelDataset;
