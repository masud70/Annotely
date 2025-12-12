// src/middleware/index.ts (CJS)
import type {
	Request,
	Response,
	NextFunction,
	ErrorRequestHandler,
	RequestHandler,
	Express,
} from "express";
import type { CsvRow, ParsedCsv } from "../types"; // ✅ no .ts extension

export {}; // ✅ ensure this file is treated as a module (avoids redeclare issues)

const multer = require("multer");
const fs = require("node:fs");
const path = require("node:path");
const { parse: csvParse } = require("csv-parse");

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const memStorage = multer.memoryStorage();
const storage = multer.diskStorage({
	destination: (_req: Request, _file: any, cb: any) => cb(null, UPLOAD_DIR),
	filename: (_req: Request, file: any, cb: any) => {
		const ts = Date.now();
		const safe = String(file.originalname).replace(/[^\w.\-]+/g, "_");
		cb(null, `${ts}__${safe}`);
	},
});

const ACCEPT = new Set([
	"text/csv",
	"application/json",
	"application/vnd.apache.parquet",
	"application/octet-stream",
]);

const uploader = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024, files: 5 },
	fileFilter: (_req: Request, file: any, cb: any) => {
		if (!ACCEPT.has(file.mimetype)) {
			return cb(new Error(`Unsupported file type: ${file.mimetype}`));
		}
		cb(null, true);
	},
});

const csvUploader = multer({
	storage: memStorage,
	limits: { fileSize: 50 * 1024 * 1024, files: 1 },
	fileFilter: (_req: Request, file: any, cb: any) => {
		const ok =
			file.mimetype === "text/csv" ||
			String(file.originalname).toLowerCase().endsWith(".csv");
		if (!ok)
			return cb(new Error(`Unsupported file type: ${file.mimetype}`));
		cb(null, true);
	},
});

const commonMiddleware: {
	errorMiddleware: ErrorRequestHandler;
	uploadFile: RequestHandler;
	uploadInMemory: RequestHandler;
	parseCsvSingle: RequestHandler;
	parseCsvBuffer(buf: Buffer): Promise<ParsedCsv>;
} = {
	uploadInMemory: (req: Request, res: Response, next: NextFunction) => {
		csvUploader.single("file")(req, res, (err?: any) => {
			if (err) return next(err);
			if (!req.file) return next(new Error("No file uploaded"));
			next();
		});
	},

	parseCsvSingle: async (
		req: Request,
		_res: Response,
		next: NextFunction
	) => {
		try {
			const file = req.file as Express.Multer.File | undefined;
			if (!file) return next(new Error("No uploaded file to parse"));

			const parsed = await commonMiddleware.parseCsvBuffer(file.buffer);
			(req.body as { parsed?: ParsedCsv }).parsed = parsed;

			next();
		} catch (e) {
			next(e);
		}
	},

	parseCsvBuffer: (buf: Buffer) => {
		return new Promise((resolve, reject) => {
			csvParse(
				buf.toString("utf8"),
				{
					bom: true,
					columns: true,
					skip_empty_lines: true,
					trim: true,
					relax_column_count: true,
				},
				(err: any, records: CsvRow[]) => {
					if (err) return reject(err);
					const columns = records.length
						? Object.keys(records[0] as any)
						: [];
					resolve({ rows: records, columns });
				}
			);
		});
	},

	uploadFile: (req: Request, res: Response, next: NextFunction) => {
		uploader.any()(req, res, (err: any) => {
			if (err) return next(err);

			const files = (req.files as Express.Multer.File[]) ?? [];
			if (!files.length) return next(new Error("No file uploaded"));

			return res.status(201).json({
				ok: true,
				count: files.length,
				files: files.map((f) => ({
					field: f.fieldname,
					filename: (f as any).filename,
					originalname: f.originalname,
					mimetype: f.mimetype,
					size: f.size,
					path: (f as any).path,
				})),
			});
		});
	},

	errorMiddleware: (err: any, _req: any, res: any, _next: any) => {
		console.error("Error:", err);
		res.status(400).json({
			ok: false,
			error: err?.message ?? "Unexpected error",
		});
	},
};

module.exports = { commonMiddleware };
