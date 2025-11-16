"use client";

import CheckboxItem from "@/components/checkboxItem";
import { Checkbox } from "@/components/ui/checkbox";
import Loader from "@/components/ui/Loader";
import { Textarea } from "@/components/ui/textarea";
import { useConfig } from "@/hooks/useConfig";
import { useParams } from "next/navigation";

export default function ConfigurePage() {
	const { id } = useParams<{ id: string }>();
	const {
		dataset,
		isLoading,
		selectedColumns,
		setSelectedColumns,
		highlightColors,
		highlightColor,
		setHighlightColor,
		keywords,
		setKeywords,
		keyColumn,
		setKeyColumn,
		selectedFile,
		setSelectedFile,
		saveConfig,
		labels,
		setLabels,
	} = useConfig(id);

	return (
		<div className="w-[90%] mx-auto py-4 space-y-4">
			<div className="w-full text-center text-3xl font-bold">
				Configure File
			</div>

			<div className="grid gap-2">
				<div className="border rounded-md p-2 grid gap-2">
					<div className="mb-1">File</div>
					<div className="flex items-center space-x-2">
						<select
							className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
							value={selectedFile}
							onChange={(e) =>
								setSelectedFile(parseInt(e.target.value))
							}
							disabled={isLoading}
						>
							{[dataset].map((f) => (
								<option key={f?.id} value={f?.id}>
									{f?.fileName}
								</option>
							))}
						</select>
						<button
							disabled={isLoading}
							className="px-2 py-2 rounded border bg-gray-800 text-white disabled:opacity-50 min-w-[120px]"
						>
							{isLoading ? "Loading…" : "Reload data"}
						</button>
					</div>
				</div>
				<div className="border rounded-md p-2 grid gap-2">
					<div className="flex justify-between">
						<div className="mb-1">Select columns</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								onClick={() =>
									setSelectedColumns((p) => {
										const all = dataset?.columns ?? [];
										return p.length !== all.length
											? all
											: [];
									})
								}
								checked={
									selectedColumns.length ===
									(dataset?.columns ?? []).length
								}
							/>
							<p>Select all</p>
						</div>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
						{dataset?.columns.map((c, idx) => (
							<CheckboxItem
								key={idx}
								checked={selectedColumns.includes(c)}
								onClick={() => {
									setSelectedColumns((p) =>
										p.includes(c)
											? p.filter((x) => x !== c)
											: [...p, c]
									);
								}}
								text={c}
							/>
						))}
					</div>
				</div>
				<div className="grid lg:grid-cols-2 gap-2">
					<div className="border rounded-md p-2 grid gap-2">
						<div className="mb-1">Index column</div>

						<select
							className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
							value={keyColumn}
							onChange={(e) => setKeyColumn(e.target.value)}
							disabled={isLoading}
						>
							<option value={undefined}>
								Choose index column
							</option>
							{selectedColumns.map((c, idx) => (
								<option key={idx} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>
					<div className="border rounded-md p-2 grid gap-2">
						<div className="mb-1">Highlight color</div>

						<select
							className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
							value={highlightColor}
							style={{ color: highlightColor }}
							onChange={(e) => setHighlightColor(e.target.value)}
							disabled={isLoading}
						>
							<option value={undefined} disabled>
								Select highlight color
							</option>
							{highlightColors.map((c, idx) => (
								<option
									selected={c === highlightColor}
									key={idx}
									value={c}
									style={{ color: c }}
								>
									{c}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="border rounded-md p-2 grid gap-2">
					<div className="mb-1">Dataset Labels</div>
					<Textarea
						placeholder="Write your dataset labels separated by comma (,)"
						value={labels}
						onChange={(e) => setLabels(e.target.value)}
					/>
				</div>

				<div className="border rounded-md p-2 grid gap-2">
					<div className="mb-1">Highlight keywords</div>
					<Textarea
						placeholder="Write your keywords separated by comma (,) or regular expressions..."
						value={keywords}
						onChange={(e) => setKeywords(e.target.value)}
					/>
				</div>
			</div>
			<div className="text-right">
				<button
					disabled={isLoading}
					onClick={saveConfig}
					className="px-2 py-2 rounded border bg-green-700 text-white disabled:opacity-50 min-w-[120px]"
				>
					Save and Proceed
				</button>
			</div>
			<Loader show={isLoading} text="Loading data..." />
		</div>
	);
}
