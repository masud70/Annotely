"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const labelService = require("../service/labelService");
const labelController = {
    getDatasetAndConfig: async (req, res, next) => {
        try {
            const datasetId = Number(req.params.id);
            if (!Number.isFinite(datasetId)) {
                return res
                    .status(400)
                    .json({ ok: false, error: "Invalid dataset id" });
            }
            const result = await labelService.getDatasetAndConfigById(datasetId);
            return res.json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    updateLabel: async (req, res, next) => {
        try {
            const result = await labelService.updateLabel(req.body);
            return res.json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    updateCode: async (req, res, next) => {
        try {
            const result = await labelService.updateCode(req.body);
            return res.json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    updateTheme: async (req, res, next) => {
        try {
            const result = await labelService.updateTheme(req.body);
            return res.json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    updateNote: async (req, res, next) => {
        try {
            const result = await labelService.updateNote(req.body);
            console.log(result);
            return res.json({ ok: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
};
module.exports = { labelController };
//# sourceMappingURL=labelController.js.map