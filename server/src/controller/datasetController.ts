// src/controller/filesController.ts
import type { Request, Response, NextFunction } from "express";
import {
	datasetService,
	getRowByName,
	listUploadedFiles,
	saveRowConfig,
} from "../service/datasetService.ts";

export const datasetController = {
	uploadDataset: async (req: Request, res: Response, next: NextFunction) => {
		try {
			console.log(req.body);
			const result = await datasetService.saveDataset({
				rows: req.body.parsed.rows,
				file: req.file!,
			});
			if (result.ok) res.json(result);
			else next("Dataset saving failed");
		} catch (error) {
			next(error);
		}
	},

	getAllDataset: async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await datasetService.getAllDataset();
			res.json({
				ok: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	},

	getDatasetById: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await datasetService.getDatasetById(
				parseInt(req.params.id)
			);
			console.log(result);
			res.json({
				ok: true,
				data: result,
			});
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
			if (!Number.isFinite(id)) next("Invalid id");

			const { fileId, ...body } = req.body;
			const result = await datasetService.updateDatasetConfig({
				fileId: id,
				body,
			});

			res.json({ ok: true, data: result });
		} catch (e) {
			next(e);
		}
	},

	exportFile: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id);
			const { columns, start, end } = req.body as {
				columns: string[];
				start: number;
				end: number;
			};

			if (!Number.isFinite(id))
				return res
					.status(400)
					.json({ ok: false, error: "Invalid dataset id" });
			if (!Array.isArray(columns) || !columns.length)
				return res
					.status(400)
					.json({ ok: false, error: "columns[] required" });
			if (
				!Number.isFinite(start) ||
				!Number.isFinite(end) ||
				start < 0 ||
				end < start
			)
				return res
					.status(400)
					.json({ ok: false, error: "Invalid start/end" });

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
			res.status(200).send(csv);
		} catch (error) {
			next(error);
		}
	},
};

export async function getAllUploads(
	_req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const data = await listUploadedFiles();
		res.json({ ok: true, data });
	} catch (err) {
		next(err);
	}
}

export async function getConfigure(
	req: Request,
	res: Response,
	next: NextFunction
) {
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
		if (!rowData)
			return res.status(404).json({ ok: false, error: "Row not found" });
		return res.json({
			ok: true,
			data: { name, row, columns, rowData, saved },
		});
	} catch (e) {
		next(e);
	}
}

export async function postConfigure(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { name, row, data } = req.body ?? {};
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
