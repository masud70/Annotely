// components/UploadsTable.tsx
import { FileSummary } from "@/types";
import { TadpoleIcon } from "./ui/icons/svg-spinners-tadpole";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function UploadsTable({
	data,
	loading,
}: {
	data: FileSummary[] | null;
	loading?: boolean;
}) {
	return (
		<div className="w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
			{/* Header */}
			<div className="grid grid-cols-[10%_45%_15%_15%_15%] bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium">
				<div>#</div>
				<div>Name</div>
				<div className="text-center">Rows</div>
				<div className="text-center">Date</div>
				<div className="text-center">Action</div>
			</div>

			{/* Body */}
			<div className="divide-y divide-gray-200 dark:divide-gray-700">
				{loading && (
					<div className="px-4 py-8 flex flex-col items-center justify-center dark:text-gray-300">
						Loading…
						<TadpoleIcon />
					</div>
				)}

				{!loading && (!data || data.length === 0) && (
					<div className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">
						No files uploaded yet.
					</div>
				)}

				{!loading &&
					data?.map((f, i) => (
						<Link
							href={
								f.configured
									? `dataset/configure/${f.id}`
									: `/dataset/label/${f.id}`
							}
							key={`${f.fileName}-${i}`}
							className="grid items-center grid-cols-[10%_45%_15%_15%_15%] px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 text-sm"
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
							<div className="text-center grid gap-2 lg:grid-cols-2">
								<Link
									href={`/dataset/configure/${f.id}`}
									className="border rounded-md p-1 bg-yellow-600"
								>
									Configure
								</Link>
								<Link
									href={`/dataset/label/${f.id}`}
									className="border rounded-md p-1 bg-green-600"
									hidden={f.configured}
								>
									Select
								</Link>
							</div>
						</Link>
					))}
			</div>
		</div>
	);
}
