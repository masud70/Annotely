import { Dataset, Label, LabelStat, Row, RSS, Token } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function useLabel(id: string) {
	const [keys, setKeys] = useState<string[]>([]);
	const [rows, setRows] = useState<Record<string, Row>>({});
	const [dataset, setDataset] = useState<Dataset | undefined>(undefined);
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [processing, setProcessing] = useState<boolean>(false);
	const [tokens, setTokens] = useState<Token[]>([]);
	const [stayOnPage, setStayOnPage] = useState<boolean>(false);

	const parseRows = useCallback((keyCol: string, dSet: Dataset) => {
		const m = new Map<string, Row>();

		for (const r of dSet?.rows ?? []) {
			const rec = r.data;
			const keyVal = rec?.[keyCol];
			if (!keyVal) continue;

			const rest: RSS = { ...rec };
			delete rest[keyCol];

			const k = String(keyVal);
			m.set(k, {
				data: rest,
				id: r.id,
				label: r.label ?? "",
				code: r.code,
				theme: r.theme,
				note: r.note,
				fileId: dSet.id,
			});
		}

		setKeys(Array.from(m.keys()));
		setRows(Object.fromEntries(m));
	}, []);

	const loadDatasetAndConfig = useCallback(
		async (id: string) => {
			setIsLoading(true);
			try {
				// Load row
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/label/${id}`,
					{
						method: "GET",
						cache: "no-store",
					}
				);
				const { ok, ...data }: { ok: boolean; data: Dataset } =
					await res.json();

				if (!ok) {
					throw new Error("Failed loading dataset");
				}
				setDataset(data.data ?? undefined);
				parseRows(data.data.keyColumn, data.data!);
				setTokens(
					data.data.keywords.map((t) => ({
						pattern: t,
						color: data.data.highlightColor,
					}))
				);
			} catch (error) {
				console.log(error);
			} finally {
				setIsLoading(false);
			}
		},
		[parseRows]
	);
	const getLabelStats = (
		rows: Record<string, Row>,
		labels: Label[],
		unlabeledName = "Unlabeled",
		unlabeledColor = "#9CA3AF",
		fallbackColor = "#A78BFA"
	): LabelStat[] => {
		const counts = new Map<string, number>();
		for (const k of Object.keys(rows)) {
			const raw = (rows[k].label ?? "").trim();
			const key = raw || unlabeledName;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		const stats: LabelStat[] = labels.map((l) => ({
			label: l.name,
			count: counts.get(l.name) ?? 0,
			color: l.color,
		}));

		const known = new Set(labels.map((l) => l.name));
		for (const [key, count] of counts) {
			if (!known.has(key) && key !== unlabeledName) {
				stats.push({ label: key, count, color: fallbackColor });
			}
		}

		stats.push({
			label: unlabeledName,
			count: counts.get(unlabeledName) ?? 0,
			color: unlabeledColor,
		});

		return stats;
	};

	useEffect(() => {
		loadDatasetAndConfig(id);
	}, [id, loadDatasetAndConfig]);

	const stats = useMemo(
		() => getLabelStats(rows, dataset?.labels ?? []),
		[rows, dataset?.labels]
	);

	const updateLabel = async ({
		rowId,
		label,
	}: {
		rowId: string;
		label: string;
	}) => {
		setProcessing(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/label/update/`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						rowId: Number(rowId),
						label,
					}),
				}
			);
			const json = (await res.json()) as { ok: boolean; data: Row };
			if (!json.ok) throw new Error("Failed updating label");

			const row = json.data;
			const rec = row.data;
			const keyCol = dataset?.keyColumn;
			if (!keyCol) throw new Error("No keyColumn on dataset");

			const keyVal = rec[keyCol];
			if (!keyVal) throw new Error(`Key "${keyCol}" missing in row data`);

			const rest: RSS = { ...rec };
			delete rest[keyCol];

			const k = String(keyVal);
			const newRow: Row = {
				fileId: dataset.id,
				data: rest,
				id: row.id,
				label: row.label ?? "",
			};

			console.log(newRow);
			setRows((prev) => ({ ...prev, [k]: newRow }));
			if (!stayOnPage)
				setCurrentIndex((p) => Math.min(p + 1, keys.length - 1));
		} catch (error) {
			console.log(error);
		} finally {
			setProcessing(false);
		}
	};

	const exportCSV = async ({
		fileId,
		selected,
		start,
		end,
	}: {
		fileId: number;
		selected: string[];
		start: number;
		end: number;
	}) => {
		try {
			setProcessing(true);
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/export/${fileId}`,
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
		} catch (error) {
			throw error;
		} finally {
			setProcessing(false);
		}
	};

	return {
		keys,
		rows,
		stats,
		currentIndex,
		setCurrentIndex,
		isLoading,
		dataset,
		updateLabel,
		tokens,
		exportCSV,
		getLabelStats,
		processing,
		stayOnPage,
		setStayOnPage,
	};
}
