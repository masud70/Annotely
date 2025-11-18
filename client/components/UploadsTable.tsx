"use client";
// components/UploadsTable.tsx
import { FileSummary } from "@/types";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import Loader from "./ui/Loader";
import { FileEditIcon, ListChecks, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmAlert } from "./ConfirmAlert";

export default function UploadsTable({
	data,
	loading,
	loadDataset,
}: {
	data: FileSummary[] | null;
	loading: boolean;
	loadDataset: () => void;
}) {
	const [openAlert, setOpenAlert] = useState<boolean>(false);

	return (
		<>
			<div className="w-full rounded-lg overflow-hidden border border-gray-400 dark:border-gray-700">
				{/* Header */}
				<div className="grid grid-cols-[5%_40%_12%_18%_25%] lg:grid-cols-[5%_40%_10%_15%_30%] bg-gray-400 dark:bg-gray-800 px-3 py-2 text-sm font-medium border-b border-gray-400">
					<div>#</div>
					<div>Name</div>
					<div className="text-center">Rows</div>
					<div className="text-center">Date</div>
					<div className="text-center">Action</div>
				</div>

				{/* Body */}
				<div className="divide-y divide-gray-200 dark:divide-gray-700">
					<Loader show={loading} transparency={0} />

					{!loading && (!data || data.length === 0) && (
						<div className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">
							No files uploaded yet.
						</div>
					)}

					{/* {loading &&
						Array.from({ length: 5 }).map((_, i) => (
							<div key={`skeleton-${i}`} className={rowGrid}>
								<div className="h-4 rounded bg-gray-300/70 dark:bg-gray-700/70" />
								<div className="h-4 rounded bg-gray-300/70 dark:bg-gray-700/70" />
								<div className="h-4 rounded bg-gray-300/70 dark:bg-gray-700/70" />
								<div className="h-4 rounded bg-gray-300/70 dark:bg-gray-700/70" />
								<div className="flex gap-2 justify-center">
									<div className="h-6 w-8 rounded bg-gray-300/70 dark:bg-gray-700/70" />
									<div className="h-6 w-8 rounded bg-gray-300/70 dark:bg-gray-700/70" />
									<div className="h-6 w-8 rounded bg-gray-300/70 dark:bg-gray-700/70" />
								</div>
							</div>
						))} */}

					{!loading &&
						data?.map((f, i) => (
							<div
								key={`${f.fileName}-${i}`}
								className="grid items-center grid-cols-[5%_40%_12%_18%_25%] lg:grid-cols-[5%_40%_10%_15%_30%] border-b border-gray-400 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 text-sm"
							>
								<div>{i + 1}</div>
								<div className="truncate" title={f.fileName}>
									{f.fileName}
								</div>
								<div className="text-center tabular-nums">
									{f.rowCount}
								</div>
								<div className="text-center uppercase">
									{formatDate(f.uploadedAt)}
								</div>
								<div
									className={`text-center grid gap-2 grid-cols-2 ${
										f.configured && "lg:grid-cols-4"
									}`}
								>
									<Link
										href={`/dataset/label/${f.id}`}
										className="border rounded-md p-1 bg-green-600 flex items-center justify-center gap-1"
										hidden={!f.configured}
										title="Label"
									>
										<ListChecks size={17} />
										<p className="pb-0.5 font-semibold hidden sm:block">
											Label
										</p>
									</Link>
									<Link
										href={`/dataset/coding/${f.id}`}
										className="border rounded-md p-1 bg-blue-600 flex items-center justify-center gap-1"
										hidden={!f.configured}
										title="Code"
									>
										<FileEditIcon size={17} />
										<p className="pb-0.5 font-semibold hidden sm:block">
											Code
										</p>
									</Link>
									<Link
										href={`/dataset/configure/${f.id}`}
										className="border rounded-md p-1 bg-yellow-600 flex items-center justify-center gap-1"
										title="Configure"
									>
										<Settings size={17} />
										<p className="pb-0.5 font-semibold hidden sm:block">
											Configure
										</p>
									</Link>
									<button
										className="border rounded-md p-1 bg-red-500 cursor-pointer flex items-center justify-center gap-1"
										title="Delete"
										onClick={() => setOpenAlert(true)}
									>
										<Trash2 size={17} />
										<p className="pb-0.5 font-semibold hidden sm:block">
											Delete
										</p>
									</button>
									<ConfirmAlert
										open={openAlert}
										onOpenChange={setOpenAlert}
										title="Delete file?"
										text="This action cannot be undone. The file and its rows will be permanently removed."
										url={`/dataset/delete/${f.id}`}
										method="DELETE"
										onDone={loadDataset}
										onError={(e) => console.error(e)}
									/>
								</div>
							</div>
						))}
				</div>
			</div>
		</>
	);
}
