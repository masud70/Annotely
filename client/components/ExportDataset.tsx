"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function ExportDataset({
	fileId,
	allColumns,
	suggestedRange,
	setOpen,
	open,
}: {
	fileId: number;
	allColumns: string[];
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	open: boolean;
	suggestedRange: { start: number; end: number };
}) {
	const [selected, setSelected] = useState<string[]>([]);
	const [start, setStart] = useState<number>(0);
	const [end, setEnd] = useState<number>(0);
	const [loading, setLoading] = useState(false);
	useEffect(() => setSelected(allColumns), [allColumns]);
	useEffect(() => {
		setStart(suggestedRange.start);
		setEnd(suggestedRange.end);
	}, [suggestedRange.start, suggestedRange.end]);

	const canDownload = useMemo(
		() =>
			selected.length > 0 &&
			Number.isFinite(start) &&
			Number.isFinite(end) &&
			start >= 0 &&
			end >= start &&
			end > 0,
		[selected, start, end]
	);

	const onToggle = (c: string) =>
		setSelected((p) =>
			p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
		);

	const downloadCsv = async () => {
		if (!canDownload) return;
		setLoading(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/dataset/export/${fileId}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ columns: selected, start, end }),
				}
			);
			if (!res.ok) {
				const t = await res.text();
				throw new Error(t || `Export failed (${res.status})`);
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			// backend sets name, but for safety:
			a.download = `dataset_${fileId}_${start}-${end}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (e) {
			console.error(e);
			alert((e as Error).message);
		} finally {
			setLoading(false);
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-[425px] lg:min-w-[600px]">
				<DialogHeader>
					<DialogTitle>Export file</DialogTitle>
					<DialogDescription>
						Choose which columns to include and the row range to
						export. The export will produce a CSV (a trailing{" "}
						<code>_label</code> column is included) for rows from
						Start to End (inclusive). Large ranges may take longer
						to prepare.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
					<div>
						<div className="font-medium mb-2">Select columns :</div>
						<div className="flex flex-wrap gap-2 justify-between">
							{allColumns.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => onToggle(c)}
									className={`px-2 py-1 rounded border ${
										selected.includes(c)
											? "bg-blue-600 text-white border-blue-600"
											: "bg-transparent text-current border-gray-400"
									}`}
								>
									{c}
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<label className="flex items-center gap-2">
							<span className="w-16">Start :</span>
							<input
								type="number"
								className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-900"
								value={start}
								min={0}
								onChange={(e) =>
									setStart(
										parseInt(e.target.value || "0", 10)
									)
								}
							/>
						</label>
						<label className="flex items-center gap-2">
							<span className="w-16">End :</span>
							<input
								type="number"
								className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-900"
								value={end}
								min={start}
								onChange={(e) =>
									setEnd(
										Math.min(
											parseInt(
												e.target.value || String(start),
												10
											),
											suggestedRange.end
										)
									)
								}
							/>
						</label>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild disabled={loading}>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button
						type="submit"
						disabled={!canDownload || loading}
						onClick={downloadCsv}
					>
						{loading ? "Preparing…" : "Download CSV"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
