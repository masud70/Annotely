import { Dataset, Row, RSS, Token } from "@/types";
import { useEffect, useState } from "react";

export default function useLabel(id: string) {
	const [keys, setKeys] = useState<string[]>([]);
	const [rows, setRows] = useState<Record<string, RSS>>({});
	const [dataset, setDataset] = useState<Dataset | undefined>(undefined);
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tokens, setTokens] = useState<Token[]>([]);

	useEffect(() => {
		loadDatasetAndConfig(id);
	}, [id]);

	const loadDatasetAndConfig = async (id: string) => {
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
	};

	const parseRows = (keyCol: string, dSet: Dataset) => {
		const out: Record<string, RSS> = {};

		for (const r of dSet?.rows || []) {
			const rec = r.data;
			const keyVal = rec?.[keyCol];

			if (!keyVal) continue;

			const { [keyCol]: _omit, ...rest } = rec;
			const k = String(keyVal);
			out[k] = { ...rest, rowId: String(r.id), _label: r.label };
		}
		setKeys(Object.keys(out));
		setRows(out);
	};

	const updateLabel = async ({
		rowId,
		label,
	}: {
		rowId: string;
		label: string;
	}) => {
		setIsLoading(true);
		try {
			console.log(`${process.env.NEXT_PUBLIC_BASE_URL}/updateLabel/`);
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

			const { [keyCol]: _omit, ...rest } = rec;
			const k = String(keyVal);
			const newRow: RSS = {
				...rest,
				rowId: String(row.id),
				_label: row.label ?? "",
			};

			console.log(newRow);
			setRows((prev) => ({ ...prev, [k]: newRow }));
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		keys,
		rows,
		currentIndex,
		setCurrentIndex,
		isLoading,
		dataset,
		updateLabel,
		tokens,
	};
}
