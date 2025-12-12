"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("multer");
const fs = require("node:fs");
const path = require("node:path");
const { parse: csvParse } = require("csv-parse");
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const memStorage = multer.memoryStorage();
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
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
    fileFilter: (_req, file, cb) => {
        if (!ACCEPT.has(file.mimetype)) {
            return cb(new Error(`Unsupported file type: ${file.mimetype}`));
        }
        cb(null, true);
    },
});
const csvUploader = multer({
    storage: memStorage,
    limits: { fileSize: 50 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
        const ok = file.mimetype === "text/csv" ||
            String(file.originalname).toLowerCase().endsWith(".csv");
        if (!ok)
            return cb(new Error(`Unsupported file type: ${file.mimetype}`));
        cb(null, true);
    },
});
const commonMiddleware = {
    uploadInMemory: (req, res, next) => {
        csvUploader.single("file")(req, res, (err) => {
            if (err)
                return next(err);
            if (!req.file)
                return next(new Error("No file uploaded"));
            next();
        });
    },
    parseCsvSingle: async (req, _res, next) => {
        try {
            const file = req.file;
            if (!file)
                return next(new Error("No uploaded file to parse"));
            const parsed = await commonMiddleware.parseCsvBuffer(file.buffer);
            req.body.parsed = parsed;
            next();
        }
        catch (e) {
            next(e);
        }
    },
    parseCsvBuffer: (buf) => {
        return new Promise((resolve, reject) => {
            csvParse(buf.toString("utf8"), {
                bom: true,
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true,
            }, (err, records) => {
                if (err)
                    return reject(err);
                const columns = records.length
                    ? Object.keys(records[0])
                    : [];
                resolve({ rows: records, columns });
            });
        });
    },
    uploadFile: (req, res, next) => {
        uploader.any()(req, res, (err) => {
            if (err)
                return next(err);
            const files = req.files ?? [];
            if (!files.length)
                return next(new Error("No file uploaded"));
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
    errorMiddleware: (err, _req, res, _next) => {
        console.error("Error:", err);
        res.status(400).json({
            ok: false,
            error: err?.message ?? "Unexpected error",
        });
    },
};
module.exports = { commonMiddleware };
//# sourceMappingURL=index.js.map