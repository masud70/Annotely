import { getColors } from "@/lib/utils";
import { Dataset, Label } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useConfig = (id: string) => {
	const [dataset, setDataset] = useState<Dataset | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
    const [processing, setProcessing]= useState<boolean>(false);
	const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
	const [highlightColor, setHighlightColor] = useState<string>();
	const [selectedFile, setSelectedFile] = useState<number>();
	const [keywords, setKeywords] = useState<string>("");
	const [keyColumn, setKeyColumn] = useState<string | undefined>(undefined);
	const [labels, setLabels] = useState<Label[]>([]);
	const [inputLabels, setInputLabels] = useState<string>("");
	const router = useRouter();
	const highlightColors = [
		"#A0DF05",
		"#B000D0",
		"#F0A000",
		"#F00040",
		"#FFDDAA",
	];

	useEffect(() => {
		loadDataset(id);
	}, [id]);

	const loadDataset = async (id: string) => {
		setIsLoading(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/dataset/${id}`,
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
			const data: Dataset = json.data;

			setDataset(data ?? []);
			setSelectedColumns(data.selectedColumns ?? []);
			setHighlightColor(data.highlightColor ?? "#FA0");
			setKeywords(data.keywords.join(", "));
			setLabels(data.labels);
			setKeyColumn(data.keyColumn);
			setInputLabels(data.labels.map((l) => l.name).join(", "));
			console.log(json);
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	const saveConfig = async () => {
		setProcessing(true);
		try {
			console.log("KW:", keywords);
			console.log("L:", labels);
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/dataset/config/${id}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						selectedColumns,
						highlightColor,
						keyColumn,
						configured: true,
						keywords: keywords.split(","),
						labels: normLabels(inputLabels),
					}),
				}
			);

			if (!res.ok) {
				const t = await res.text();
				throw new Error(t || `Failed to update config (${res.status})`);
			}
			const json = await res.json();
			console.log(json);
			router.push(`/dataset/label/${id}`);
		} catch (error) {
			console.log(error);
		} finally {
			setProcessing(false);
		}
	};

	const normLabels = (v: string): Label[] => {
		const colors = getColors(v.length);
		return v
			.trim()
			.split(",")
			.map((l, idx) => ({
				name: l,
				color: colors[idx],
			}));
	};

	return {
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
		inputLabels,
		setInputLabels,
        processing
	};
};
