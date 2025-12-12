// src/service/filesService.ts
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const csvParse = require("csv-parse");
const parquet = require("parquetjs-lite");
import type { FileSummary, FileType, RSS } from "../types/index";
const { db } = require("../lib/db");
const { chunk, esc } = require("../lib/utils");

const UPLOAD_DIR = path.join(
	process.cwd(),
	process.env.UPLOAD_PATH || "uploads"
);
const CONFIG_DIR = path.join(UPLOAD_DIR, process.env.CONFIG_PATH || "config");

module.exports = {
	saveDataset: async ({
		rows,
		file,
	}: {
		rows: Record<string, string>[];
		file: Record<string, any>;
	}) => {
		try {
			if (!rows || rows.length === 0) {
				throw new Error("CSV is empty or not parsed.");
			}
			const createdFile = await db.file.create({
				data: {
					fileType: file.originalname.toLowerCase().split(".").pop(),
					fileName: file.originalname,
					columns: Object.keys(rows[0]),
					selectedColumns: [],
					keywords: [],
					lastUpdatedRow: null,
				},
			});

			const rowPayload = rows.map((r, idx) => {
				const { _code, _label, _theme, _note, ...data } = r;
				return {
					fileId: createdFile.id,
					rowIndex: idx,
					data: data,
					label: _label ?? null,
					code: _code ?? null,
					theme: _theme ?? null,
					note: _note ?? null,
				};
			});

			const labels: string[] = Array.from(
				new Set(
					rowPayload.map((r) => r.label).filter((l) => l) as string[]
				)
			);
			if (labels) {
				const incoming = labels.map((l) => ({ name: l, color: null }));

				for (const lab of incoming) {
					await db.label.upsert({
						where: {
							fileId_name: {
								fileId: createdFile.id,
								name: lab.name,
							},
						},
						update: { color: lab.color },
						create: {
							fileId: createdFile.id,
							name: lab.name,
							color: lab.color,
						},
					});
				}

				const keep = incoming.map((l) => l.name);
				await db.label.deleteMany({
					where: {
						fileId: createdFile.id,
						...(keep.length ? { name: { notIn: keep } } : {}),
					},
				});
			}

			for (const batch of chunk(rowPayload, 1000)) {
				await db.row.createMany({ data: batch });
			}

			return {
				ok: true,
				fileId: createdFile.id,
				fileName: createdFile.fileName,
				fileType: createdFile.fileType,
				columns: Object.keys(rows[0]),
				totalRows: rows.length,
			};
		} catch (error) {
			throw error;
		}
	},

	getAllDataset: async () => {
		try {
			const files = await db.file.findMany({
				select: {
					id: true,
					fileName: true,
					uploadedAt: true,
					updatedAt: true,
					configured: true,
					_count: { select: { rows: true } },
				},
				orderBy: { uploadedAt: "desc" },
			});

			return files.map((f: any) => ({
				id: f.id,
				fileName: f.fileName,
				rowCount: f._count.rows,
				configured: f.configured,
				uploadedAt: f.uploadedAt.toISOString(),
				updatedAt: f.updatedAt.toISOString(),
			}));
		} catch (error) {
			throw error;
		}
	},

	getDatasetById: async (id: number) => {
		try {
			const result = await db.file.findUnique({
				where: { id },
				include: {
					labels: true,
				},
			});
			return result;
		} catch (error) {
			throw error;
		}
	},

	updateDatasetConfig: async ({
		fileId,
		body,
	}: {
		fileId: number;
		body: Record<string, any>;
	}) => {
		try {
			const { labels, keywords, selectedColumns, keyColumn, ...data } =
				body;

			if (selectedColumns.length < 2) {
				throw new Error("At least two columns must be selected.");
			} else if (keyColumn.trim() === "") {
				throw new Error("Key column cannot be empty.");
			} else if (!selectedColumns.includes(keyColumn)) {
				throw new Error(
					"Key column must be one of the selected columns."
				);
			}

			await db.file.update({
				where: { id: fileId },
				data: {
					...data,
					keywords: keywords.map((k: string) => k.trim()),
					selectedColumns,
					keyColumn,
					configured: true,
				},
			});

			if (labels) {
				const incoming = labels
					.filter((l: RSS) => l?.name?.trim())
					.map((l: RSS) => ({
						name: l.name.trim(),
						color: l.color ?? null,
					}));

				for (const lab of incoming) {
					await db.label.upsert({
						where: { fileId_name: { fileId, name: lab.name } },
						update: { color: lab.color },
						create: { fileId, name: lab.name, color: lab.color },
					});
				}

				const keep = incoming.map((l: RSS) => l.name);
				await db.label.deleteMany({
					where: {
						fileId,
						...(keep.length ? { name: { notIn: keep } } : {}),
					},
				});
			}

			// 3) Return fresh summary
			const updated = await db.file.findUniqueOrThrow({
				where: { id: fileId },
				include: { labels: true, _count: { select: { rows: true } } },
			});

			return updated;
		} catch (error) {
			throw error;
		}
	},

	exportAsCSV: async ({
		fileId,
		columns,
		start,
		end,
	}: {
		fileId: number;
		columns: string[];
		start: number;
		end: number;
	}) => {
		try {
			const file = await db.file.findUniqueOrThrow({
				where: { id: fileId },
				select: { fileName: true },
			});

			const rows = await db.row.findMany({
				where: { fileId, rowIndex: { gte: start, lt: end } },
				orderBy: { rowIndex: "asc" },
				select: {
					data: true,
					rowIndex: true,
					label: true,
					code: true,
					theme: true,
					note: true,
				},
			});

			const header = columns.map(esc).join(",") + "\r\n";
			const body = rows
				.map((r: any) => {
					const rec = r.data as Record<string, unknown>;
					rec._label = r.label ?? "";
					rec._code = r.code ?? "";
					rec._theme = r.theme ?? "";
					rec._note = r.note ?? "";
					const line = columns.map((c) => esc(rec?.[c]));
					return line.join(",");
				})
				.join("\r\n");

			const csv = header + body + (body ? "\r\n" : "");
			const base = file.fileName.replace(/\.[^.]+$/, "");
			const filename = `${base}_rows_${start}-${end}.csv`;
			return { filename, csv };
		} catch (error) {
			throw error;
		}
	},

	deleteDataset: async (fileId: number) => {
		try {
			const result = await db.file.delete({
				where: { id: fileId },
			});
			return result;
		} catch (error) {
			throw error;
		}
	},
};

function detectFileType(filename: string): FileType {
	const ext = path.extname(filename).toLowerCase();
	if (ext === ".csv") return "csv";
	if (ext === ".json" || ext === ".jsonl" || ext === ".ndjson") return "json";
	if (ext === ".parquet") return "parquet";
	return "unknown";
}
function extOf(name: string) {
	return path.extname(name).toLowerCase();
}
async function ensureDirs() {
	await fsp.mkdir(UPLOAD_DIR, { recursive: true });
	await fsp.mkdir(CONFIG_DIR, { recursive: true });
}

async function summarizeCSV(
	filePath: string
): Promise<{ rows: number; columns: string[] }> {
	return new Promise((resolve, reject) => {
		let rows = 0;
		let columns: string[] = [];
		const rs = fs.createReadStream(filePath);
		const parser = csvParse({
			bom: true,
			columns: true,
			relax_column_count: true,
			skip_empty_lines: true,
			trim: true,
		});
		parser.on("readable", () => {
			let record;
			while ((record = parser.read()) !== null) {
				if (rows === 0 && columns.length === 0)
					columns = Object.keys(record);
				rows++;
			}
		});
		parser.on("error", reject);
		parser.on("end", () => resolve({ rows, columns }));
		rs.pipe(parser);
	});
}

async function summarizeJSON(
	filePath: string
): Promise<{ rows: number; columns: string[] }> {
	// Simple approach: load whole file. For huge files, switch to a streaming json parser.
	const raw = await fsp.readFile(filePath, "utf8");
	let rows = 0;
	let columns: string[] = [];
	try {
		const data = JSON.parse(raw);
		if (Array.isArray(data)) {
			rows = data.length;
			// union of keys across first few items (avoid scanning all)
			const sample = data.slice(0, 50);
			const keySet = new Set<string>();
			for (const item of sample) {
				if (item && typeof item === "object") {
					Object.keys(item).forEach((k) => keySet.add(k));
				}
			}
			columns = Array.from(keySet);
		} else if (data && typeof data === "object") {
			rows = 1;
			columns = Object.keys(data);
		} else {
			rows = 1;
			columns = [];
		}
	} catch {
		// Maybe JSONL/NDJSON
		const lines = raw
			.split(/\r?\n/)
			.filter((l: any) => l.trim().length > 0);
		rows = 0;
		const keys = new Set<string>();
		for (const l of lines.slice(0, 200)) {
			try {
				const obj = JSON.parse(l);
				rows++;
				if (obj && typeof obj === "object")
					Object.keys(obj).forEach((k) => keys.add(k));
			} catch {
				// ignore bad lines
			}
		}
		columns = Array.from(keys);
		if (rows === 0) rows = lines.length; // fallback
	}
	return { rows, columns };
}

async function summarizeParquet(
	filePath: string
): Promise<{ rows: number; columns: string[] }> {
	const reader = await parquet.ParquetReader.openFile(filePath);
	try {
		const schema = reader.schema?.fields ?? {};
		const columns = Object.keys(schema);
		let rows = 0;
		const cursor = reader.getCursor();
		while (await cursor.next()) rows++;
		return { rows, columns };
	} finally {
		await reader.close();
	}
}

async function readCsvRow(
	filePath: string,
	rowIndex: number
): Promise<Record<string, any> | null> {
	return new Promise((resolve, reject) => {
		let idx = -1;
		let found: Record<string, any> | null = null;

		const rs = fs.createReadStream(filePath);
		const parser = csvParse({
			bom: true,
			columns: true,
			skip_empty_lines: true,
			trim: true,
			relax_column_count: true,
		});

		parser.on("readable", () => {
			let rec;
			while ((rec = parser.read()) !== null) {
				idx++;
				if (idx === rowIndex) {
					found = rec;
					rs.destroy(); // stop reading more
					parser.destroy();
					resolve(found);
					return;
				}
			}
		});
		parser.on("end", () => resolve(found)); // may be null
		parser.on("error", reject);
		rs.pipe(parser);
	});
}

async function readJsonRow(
	filePath: string,
	rowIndex: number
): Promise<Record<string, any> | null> {
	const raw = await fsp.readFile(filePath, "utf8");
	try {
		const data = JSON.parse(raw);
		if (Array.isArray(data)) {
			return data[rowIndex] ?? null;
		}
		// single object – only rowIndex 0 makes sense
		return rowIndex === 0 && data && typeof data === "object" ? data : null;
	} catch {
		// try JSONL
		const lines = raw.split(/\r?\n/).filter(Boolean);
		if (rowIndex < 0 || rowIndex >= lines.length) return null;
		try {
			return JSON.parse(lines[rowIndex]);
		} catch {
			return null;
		}
	}
}

async function readParquetRow(
	filePath: string,
	rowIndex: number
): Promise<Record<string, any> | null> {
	const reader = await parquet.ParquetReader.openFile(filePath);
	try {
		let idx = -1;
		const cursor = reader.getCursor();
		let row: any;
		while ((row = await cursor.next())) {
			idx++;
			if (idx === rowIndex) return row as Record<string, any>;
		}
		return null;
	} finally {
		await reader.close();
	}
}

export async function getRowByName(name: string, rowIndex: number) {
	await ensureDirs();
	const filePath = path.join(UPLOAD_DIR, name);
	const ext = extOf(name);
	let row: Record<string, any> | null = null;
	if (ext === ".csv") row = await readCsvRow(filePath, rowIndex);
	else if (ext === ".json" || ext === ".jsonl" || ext === ".ndjson")
		row = await readJsonRow(filePath, rowIndex);
	else if (ext === ".parquet") row = await readParquetRow(filePath, rowIndex);
	else row = null;

	// columns == keys of row if present
	const columns = row ? Object.keys(row) : [];

	// also try to load any existing sidecar for this row
	const sidecarPath = path.join(CONFIG_DIR, `${name}.row.${rowIndex}.json`);
	let saved: Record<string, any> | null = null;
	try {
		const s = await fsp.readFile(sidecarPath, "utf8");
		saved = JSON.parse(s);
	} catch {
		saved = null;
	}

	return { row, columns, saved };
}

export async function saveRowConfig(
	name: string,
	rowIndex: number,
	data: Record<string, any>
) {
	await ensureDirs();
	const sidecarPath = path.join(CONFIG_DIR, `${name}.row.${rowIndex}.json`);
	await fsp.writeFile(
		sidecarPath,
		JSON.stringify({ name, row: rowIndex, data }, null, 2),
		"utf8"
	);
	return { name, row: rowIndex, data, savedAt: new Date().toISOString() };
}

export async function listUploadedFiles(): Promise<FileSummary[]> {
	// Ensure dir exists
	await fsp.mkdir(UPLOAD_DIR, { recursive: true });
	const entries = await fsp.readdir(UPLOAD_DIR, { withFileTypes: true });

	const summaries: FileSummary[] = [];
	for (const ent of entries) {
		if (!ent.isFile()) continue;
		const filePath = path.join(UPLOAD_DIR, ent.name);
		const stat = await fsp.stat(filePath);
		const fileType = detectFileType(ent.name);

		try {
			if (fileType === "csv") {
				const { rows, columns } = await summarizeCSV(filePath);
				summaries.push({
					name: ent.name,
					fileType,
					size: stat.size,
					rows,
					columns,
				});
			} else if (fileType === "json") {
				const { rows, columns } = await summarizeJSON(filePath);
				summaries.push({
					name: ent.name,
					fileType,
					size: stat.size,
					rows,
					columns,
				});
			} else if (fileType === "parquet") {
				const { rows, columns } = await summarizeParquet(filePath);
				summaries.push({
					name: ent.name,
					fileType,
					size: stat.size,
					rows,
					columns,
				});
			} else {
				summaries.push({
					name: ent.name,
					fileType,
					size: stat.size,
					rows: 0,
					columns: [],
				});
			}
		} catch (e) {
			// On parse error, still return minimal info
			summaries.push({
				name: ent.name,
				fileType,
				size: stat.size,
				rows: 0,
				columns: [],
			});
		}
	}

	return summaries.sort((a, b) => a.name.localeCompare(b.name));
}

export const saveFileContent = async ({
	data,
}: {
	data: Record<string, string>[];
}) => {
	try {
	} catch (error) {
		throw error;
	}
};
