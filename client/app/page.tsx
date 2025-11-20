"use client";
import Loader from "@/components/ui/Loader";
import UploadsTable from "@/components/UploadsTable";
import useUpload from "@/hooks/useUpload";
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

export default function Home() {
	const {
		uploading,
		files,
		uploaded,
		gettingFiles,
		handleDrop,
		getAllDatasets,
	} = useUpload();

	return (
		<div className="w-full text-black dark:text-white items-center flex justify-center">
			<div className="w-[90%] flex items-center flex-col space-y-4 py-2">
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
					className="w-full h-[250px] bg-gray-400 rounded-lg flex items-center justify-center"
				>
					<DropzoneEmptyState />
					<DropzoneContent />
				</Dropzone>
				{/* <div className="w-full bg-gray-400/15 rounded-lg p-2">
					<select className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
						<option
							className="bg-gray-500 hover:bg-gray-600"
							value=""
							selected
						>
							Select Dataset Type
						</option>
						<option
							className="bg-gray-500 hover:bg-gray-600 p-4"
							value="tabular"
						>
							Tabular
						</option>
						<option
							className="bg-gray-500 hover:bg-gray-600"
							value="text"
						>
							Text
						</option>
						<option
							className="bg-gray-500 hover:bg-gray-600"
							value="image"
						>
							Image
						</option>
					</select>
				</div> */}
				<div className="w-full mx-auto space-y-4">
					<UploadsTable
						data={uploaded}
						loading={gettingFiles}
						loadDataset={getAllDatasets}
					/>
				</div>
				<Loader
					show={uploading}
					global
					transparency={100}
					text="Uploading file..."
				/>
			</div>
		</div>
	);
}
