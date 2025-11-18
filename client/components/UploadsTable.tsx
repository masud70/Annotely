// components/UploadsTable.tsx
import { FileSummary } from "@/types";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import Loader from "./ui/Loader";
import { FileEditIcon, ListChecks, Settings } from "lucide-react";

export default function UploadsTable({
	data,
	loading,
}: {
	data: FileSummary[] | null;
	loading: boolean;
}) {
	return (
		<>
			<div className="w-full rounded-lg overflow-hidden border border-gray-400 dark:border-gray-700">
				{/* Header */}
				<div className="grid grid-cols-[5%_40%_12%_18%_25%] bg-gray-400 dark:bg-gray-800 px-3 py-2 text-sm font-medium">
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

					{!loading &&
						data?.map((f, i) => (
							<div
								key={i}
								className="grid items-center grid-cols-[5%_40%_12%_18%_25%] border-b border-gray-400 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 text-sm"
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
								<div className="text-center grid gap-2 grid-cols-3">
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
								</div>
							</div>
						))}
				</div>
			</div>
		</>
	);
}
