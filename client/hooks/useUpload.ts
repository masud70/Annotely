import { FileSummary } from "@/types";
import { useEffect, useState } from "react";

export default function useUpload() {
	const [uploading, setUploading] = useState<boolean>(false);
	const [gettingFiles, setGettingFiles] = useState<boolean>(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState<string | null>(null);
	const [files, setFiles] = useState<File[] | undefined>();
	const [uploaded, setUploaded] = useState<FileSummary[] | null>(null);

	useEffect(() => {
		void getAllDatasets();
	}, []);

	const getAllDatasets = async () => {
		setGettingFiles(true);
		setError(null);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/dataset`,
				{
					method: "GET",
					cache: "no-store",
				}
			);

			if (!res.ok) {
				const t = await res.text();
				throw new Error(t || `Failed to load files (${res.status})`);
			}

			const json = await res.json();
			setUploaded(json?.data ?? []);
			console.log(json);
		} catch (e) {
			console.log(e);
		} finally {
			setGettingFiles(false);
		}
	};

	const uploadFile = async (file: File) => {
		setUploading(true);
		setError(null);
		setResult(null);
		try {
			const form = new FormData();
			form.append("file", file);

			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/dataset/upload`,
				{
					method: "POST",
					body: form,
				}
			);

			if (!res.ok) {
				const t = await res.text();
				throw new Error(t || `Upload failed (${res.status})`);
			}
			const json = await res.json();
			setResult(json);
			console.log(json);
			await getAllDatasets();
		} catch {
			setError("An error occured.");
		} finally {
			setUploading(false);
		}
	};

	const handleDrop = async (dropped: File[]) => {
		console.log("dropped", dropped);
		setFiles(dropped);
		if (dropped?.[0]) {
			await uploadFile(dropped[0]);
		}
	};

	return {
		uploading,
		result,
		error,
		uploadFile,
		files,
		setFiles,
		gettingFiles,
		uploaded,
		handleDrop,
	};
}
