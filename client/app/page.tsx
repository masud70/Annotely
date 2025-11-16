"use client";
import Loader from "@/components/ui/Loader";
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import UploadsTable from "@/components/UploadsTable";
import useUpload from "@/hooks/useUpload";

export default function Home() {
	const { uploading, files, uploaded, gettingFiles, handleDrop } =
		useUpload();

	return (
		<div className=" text-black dark:text-white flex items-center flex-col space-y-4 py-2">
			<Dropzone
				accept={{
					"text/csv": [],
					"application/json": [],
					"application/vnd.apache.parquet": [],
				}}
				maxFiles={1}
				maxSize={1024 * 1024 * 50}
				minSize={10}
				onDrop={handleDrop}
				onError={console.error}
				src={files}
				className="w-[90%] h-[250px] bg-gray-600 rounded-lg flex items-center justify-center"
			>
				<DropzoneEmptyState />
				<DropzoneContent />
			</Dropzone>
			<div className="w-[90%] mx-auto space-y-4">
				<UploadsTable data={uploaded} loading={gettingFiles} />
			</div>
			<Loader show={uploading} text="Uploading file..." />
		</div>
	);
}
