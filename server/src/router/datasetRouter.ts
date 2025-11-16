// src/router/files.ts
import { Router } from "express";
import {
    datasetController,
	getConfigure,
	postConfigure,
} from "../controller/datasetController.ts";
import { commonMiddleware } from "../middleware/index.ts";

const datasetRouter = Router();

// GET /files — list all uploaded files with columns/rows/type
datasetRouter.get("/:id", datasetController.getDatasetById);
datasetRouter.get("/", datasetController.getAllDataset);
// filesRouter.post("/upload", commonMiddleware.uploadFile);
datasetRouter.post(
	"/upload",
	commonMiddleware.uploadInMemory,
	commonMiddleware.parseCsvSingle,
	datasetController.uploadDataset
);
datasetRouter.get("/config", getConfigure);
datasetRouter.patch("/config/:id", datasetController.updateDatasetConfig);

export default datasetRouter;
