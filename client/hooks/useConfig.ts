import { Dataset, RSU } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useConfig = (id: string) => {
	const [dataset, setDataset] = useState<Dataset | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
	const [highlightColor, setHighlightColor] = useState<string>();
	const [selectedFile, setSelectedFile] = useState<number>();
	const [keywords, setKeywords] = useState<string | undefined>(undefined);
	const [keyColumn, setKeyColumn] = useState<string | undefined>(undefined);
	const [labels, setLabels] = useState<string>("");
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
			setDataset(json?.data ?? []);
			setSelectedColumns(json?.data.selectedColumns ?? []);
			setHighlightColor(json?.data.highlightColor ?? "#FA0");
			setKeywords(json?.data.keywords ?? undefined);
			setLabels(json?.data.labels.map((l: RSU) => l.name));
			setKeyColumn(json?.data.keyColumn);
			console.log(json);
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	const saveConfig = async () => {
		setIsLoading(true);
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
						keywords: normKeywords(keywords),
						labels: normLabels(labels),
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
			setIsLoading(false);
		}
	};

	const normKeywords = (v: string | string[] | undefined): string[] => {
		if (Array.isArray(v)) return [...new Set(v)];
		if (typeof v === "string") return [...new Set(v.split(","))];
		else return [];
	};

	const normLabels = (v: string | string[]): { name: string }[] => {
		if (Array.isArray(v)) return v.map((l) => ({ name: l }));
		if (typeof v === "string")
			return [...new Set(v.split(",").map((s) => s.trim()))].map(
				(name) => ({ name })
			);
		else return [];
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
	};
};
