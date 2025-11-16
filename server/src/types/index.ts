// src/types/files.ts
export type FileType = "csv" | "json" | "parquet" | "unknown";

export interface FileSummary {
	name: string; // filename with extension
	fileType: FileType;
	size: number; // bytes
	rows: number; // #rows or items
	columns: string[]; // headers/keys
}

export type CsvRow = Record<string, string>;
export interface ParsedCsv {
	rows: CsvRow[];
	columns: string[];
}

export type RSS = Record<string, string>
export type RSA = Record<string, string>