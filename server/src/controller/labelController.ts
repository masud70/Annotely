// ./src/service/labelController.ts
import { NextFunction, Request, Response } from "express";
import { labelService } from "../service/labelService.ts";

export const labelController = {
	getDatasetAndConfig: async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const datasetId = parseInt(req.params.id);
			const result = await labelService.getDatasetAndConfigById(
				datasetId
			);
			res.json({
				ok: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	},

	updateLabel: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await labelService.updateLabel(req.body);
			res.json({
				ok: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	},

	updateCode: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await labelService.updateCode(req.body);
			res.json({
				ok: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	},

	updateTheme: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await labelService.updateTheme(req.body);
			res.json({
				ok: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	}
};
