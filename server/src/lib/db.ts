import fs from "node:fs/promises";
import path from "node:path";
import { parse as csvParse } from "csv-parse";
import { PrismaClient } from "@prisma/client";
export const db = new PrismaClient();

export type Row = Record<string, string>;
const CONFIG_BASENAME = "configuration.csv";

export class DB {
	_fileId?: string;
	_fileName?: string;
	_filePath?: string;
	_uploadDate?: string;
	_keywords: string[] = [];
	_labels: string[] = [];
	_lastUpdatedRow?: any;
	_keyColumn?: string;
	_selectedColumns: string[] = [];
	_highlightColor?: string;
	_headers: string[] = [];
	_rows: Row[] = [];
	_upDatedAt?: string;

	constructor({ fileId }: { fileId: number }) {
		this.loadConfiguration(fileId);
	}

	async loadConfiguration(fileId: number) {
		try {
			const cfgPath = path.join(
				process.cwd(),
				"uploads",
				CONFIG_BASENAME
			);
			const text = await fs.readFile(cfgPath, "utf8");

			const rows: Row[] = await new Promise((resolve, reject) => {
				const out: any[] = [];
				csvParse(text, {
					bom: true,
					columns: true,
					trim: true,
					skip_empty_lines: true,
				})
					.on("readable", function (this: any) {
						let r;
						while ((r = this.read()) !== null) out.push(r);
					})
					.on("end", () => resolve(out))
					.on("error", reject);
			});

			const row = rows.filter((r) => parseInt(r["fileId"]) === fileId)[0];

			this._fileId = row["fileId"];
			this._filePath = row["filePath"];
			this._highlightColor = row["highlightColor"];
			this._keyColumn = row["keyColumn"];
			this._lastUpdatedRow = row["lastUpdatedRow"];
			this._headers = row["headers"]?.split(",") || [];
			this._keywords = row["keywords"]?.split(",") || [];
			this._labels = row["labels"]?.split(",") || [];
			this._fileName = row["fileName"];
			this._selectedColumns = row["selectedColumns"]?.split(",") || [];
			this._upDatedAt = row["upDatedAt"];
			this._uploadDate = row["uploadDate"];

			this.loadFile(this._filePath!);
		} catch (error) {
			console.log("Error:", error);
		}
	}

	async loadFile(filePath: string) {
		try {
			const csvText = await fs.readFile(filePath, "utf8");
			const rows: Row[] = await new Promise((resolve, reject) => {
				const out: Row[] = [];
				csvParse(csvText, {
					bom: true,
					columns: true,
					skip_empty_lines: true,
					trim: true,
					relax_column_count: true,
				})
					.on("readable", function (this: any) {
						let r: Row | null;
						while ((r = this.read()) !== null) out.push(r);
					})
					.on("end", () => resolve(out))
					.on("error", reject);
			});
			this._rows = rows;
			this._headers = this._inferHeaders(rows);
		} catch (error) {
			console.log(error);
		}
	}

	async saveMetadata() {
		// Save the current metadata to configuration.csv file
	}

	private ensureIndex(index: number) {
		if (index < 0 || index >= this._rows.length)
			throw new Error(`Row index out of bounds: ${index}`);
	}

	get headers() {
		return [...this._headers];
	}
	get length() {
		return this._rows.length;
	}
	toArray(): Row[] {
		return this._rows.map((r) => ({ ...r }));
	}
	getRow(index: number): Row | undefined {
		return this._rows[index] ? { ...this._rows[index] } : undefined;
	}

	private _inferHeaders(rows: Row[]): string[] {
		const set = new Set<string>();
		for (const r of rows) for (const k of Object.keys(r)) set.add(k);
		return Array.from(set);
	}
}
