// src/controller/labelController.ts (CJS)
import type { NextFunction, Request, Response } from "express";
export {}; // ✅ force module scope

const labelService  = require("../service/labelService");

const labelController = {
	getDatasetAndConfig: async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const datasetId = Number(req.params.id);
			if (!Number.isFinite(datasetId)) {
				return res
					.status(400)
					.json({ ok: false, error: "Invalid dataset id" });
			}

			const result = await labelService.getDatasetAndConfigById(
				datasetId
			);
			return res.json({ ok: true, data: result });
		} catch (error) {
			next(error);
		}
	},

	updateLabel: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await labelService.updateLabel(req.body);
			return res.json({ ok: true, data: result });
		} catch (error) {
			next(error);
		}
	},

	updateCode: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await labelService.updateCode(req.body);
			return res.json({ ok: true, data: result });
		} catch (error) {
			next(error);
		}
	},

	updateTheme: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await labelService.updateTheme(req.body);
			return res.json({ ok: true, data: result });
		} catch (error) {
			next(error);
		}
	},

	updateNote: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await labelService.updateNote(req.body);
			console.log(result);
			return res.json({ ok: true, data: result });
		} catch (error) {
			next(error);
		}
	},
};

module.exports = { labelController };
