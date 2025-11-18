// src/middleware/index.ts
import type {
	Request,
	Response,
	NextFunction,
	ErrorRequestHandler,
	RequestHandler,
} from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { parse as csvParse } from "csv-parse";
import { CsvRow, ParsedCsv } from "../types/index.ts";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const memStorage = multer.memoryStorage();
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
	filename: (_req, file, cb) => {
		const ts = Date.now();
		const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
		cb(null, `${ts}__${safe}`);
	},
});

const ACCEPT = new Set([
	"text/csv",
	"application/json",
	"application/vnd.apache.parquet",
	"application/octet-stream", // some browsers send parquet as octet-stream
]);

const uploader = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024, files: 5 },
	fileFilter: (_req, file, cb) => {
		if (!ACCEPT.has(file.mimetype))
			return cb(new Error(`Unsupported file type: ${file.mimetype}`));
		cb(null, true);
	},
});
const csvUploader = multer({
	storage: memStorage,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB
		files: 1,
	},
	fileFilter: (_req, file, cb) => {
		const ok =
			file.mimetype === "text/csv" ||
			file.originalname.toLowerCase().endsWith(".csv");
		if (!ok)
			return cb(new Error(`Unsupported file type: ${file.mimetype}`));
		else cb(null, true);
	},
});

export const commonMiddleware: {
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
			// attach to body in a typed-safe-ish way without global augmentation
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
					columns: true, // first row = header
					skip_empty_lines: true,
					trim: true,
					relax_column_count: true,
				},
				(err, records: CsvRow[]) => {
					if (err) return reject(err);
					const columns = records.length
						? Object.keys(records[0])
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
					filename: f.filename,
					originalname: f.originalname,
					mimetype: f.mimetype,
					size: f.size,
					path: f.path,
				})),
			});
		});
	},

	errorMiddleware: (err: any, _req, res, _next) => {
		console.error("Error:", err);
		res.status(400).json({
			ok: false,
			error: err?.message ?? "Unexpected error",
		});
	},
};
