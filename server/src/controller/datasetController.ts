// src/controller/datasetController.ts (CJS)
import type { Request, Response, NextFunction } from "express";
import { saveRowConfig } from "../service/datasetService";
const datasetService = require("../service/datasetService");
const getRowByName = require("../service/datasetService");
export {}; // ✅ force module scope

const datasetController = {
	uploadDataset: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await datasetService.saveDataset({
				rows: (req.body as any).parsed.rows,
				file: req.file!,
			});
			if (result.ok) return res.json(result);
			return next(new Error("Dataset saving failed"));
		} catch (error) {
			next(error);
		}
	},

	getAllDataset: async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await datasetService.getAllDataset();
			return res.json({ ok: true, data: result });
		} catch (error) {
			next(error);
		}
	},

	getDatasetById: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			if (!Number.isFinite(id)) {
				return res
					.status(400)
					.json({ ok: false, error: "Invalid dataset id" });
			}
			const result = await datasetService.getDatasetById(id);
			return res.json({ ok: true, data: result });
		} catch (error) {
			next(error);
		}
	},

	updateDatasetConfig: async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const id = Number(req.params.id);
			if (!Number.isFinite(id)) {
				return res.status(400).json({ ok: false, error: "Invalid id" });
			}

			const { fileId: _fileId, ...body } = (req.body ?? {}) as any;
			const result = await datasetService.updateDatasetConfig({
				fileId: id,
				body,
			});

			return res.json({ ok: true, data: result });
		} catch (e) {
			next(e);
		}
	},

	exportFile: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const { columns, start, end } = (req.body ?? {}) as {
				columns: string[];
				start: number;
				end: number;
			};

			if (!Number.isFinite(id)) {
				return res
					.status(400)
					.json({ ok: false, error: "Invalid dataset id" });
			}
			if (!Array.isArray(columns) || columns.length === 0) {
				return res
					.status(400)
					.json({ ok: false, error: "columns[] required" });
			}
			if (
				!Number.isFinite(start) ||
				!Number.isFinite(end) ||
				start < 0 ||
				end < start
			) {
				return res
					.status(400)
					.json({ ok: false, error: "Invalid start/end" });
			}

			const { filename, csv } = await datasetService.exportAsCSV({
				fileId: id,
				columns,
				start,
				end,
			});

			res.setHeader("Content-Type", "text/csv; charset=utf-8");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${filename}"`
			);
			return res.status(200).send(csv);
		} catch (error) {
			next(error);
		}
	},

	deleteDataset: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			if (!Number.isFinite(id)) {
				return res
					.status(400)
					.json({ ok: false, error: "Invalid file id" });
			}

			const result = await datasetService.deleteDataset(id);
			return res.json({ ok: true, data: result });
		} catch (e) {
			next(e);
		}
	},
};

async function getAllUploads(_req: Request, res: Response, next: NextFunction) {
	try {
		const data = await datasetService.listUploadedFiles();
		return res.json({ ok: true, data });
	} catch (err) {
		next(err);
	}
}

async function getConfigure(req: Request, res: Response, next: NextFunction) {
	try {
		const name = String(req.query.name ?? "");
		const row = Number(req.query.row ?? -1);

		if (!name || row < 0 || Number.isNaN(row)) {
			return res.status(400).json({
				ok: false,
				error: "Query params 'name' and valid 'row' are required",
			});
		}

		const { row: rowData, columns, saved } = await getRowByName(name, row);
		if (!rowData) {
			return res.status(404).json({ ok: false, error: "Row not found" });
		}

		return res.json({
			ok: true,
			data: { name, row, columns, rowData, saved },
		});
	} catch (e) {
		next(e);
	}
}

async function postConfigure(req: Request, res: Response, next: NextFunction) {
	try {
		const { name, row, data } = (req.body ?? {}) as any;

		if (
			!name ||
			typeof row !== "number" ||
			row < 0 ||
			typeof data !== "object" ||
			data == null
		) {
			return res.status(400).json({
				ok: false,
				error: "Body must include { name, row, data }",
			});
		}

		const saved = await saveRowConfig(
			String(name),
			Number(row),
			data as Record<string, any>
		);
		return res.status(201).json({ ok: true, data: saved });
	} catch (e) {
		next(e);
	}
}

module.exports = {
	datasetController,
	getAllUploads,
	getConfigure,
	postConfigure,
};
