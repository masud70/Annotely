"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require("express");
const { datasetController, getConfigure, postConfigure, // (you import it but don't use it—keep/remove as you like)
 } = require("../controller/datasetController");
const { commonMiddleware } = require("../middleware");
const datasetRouter = Router();
// GET /files — list all uploaded files with columns/rows/type
datasetRouter.get("/:id", datasetController.getDatasetById);
datasetRouter.get("/", datasetController.getAllDataset);
// datasetRouter.post("/upload", commonMiddleware.uploadFile);
datasetRouter.post("/upload", commonMiddleware.uploadInMemory, commonMiddleware.parseCsvSingle, datasetController.uploadDataset);
datasetRouter.get("/config", getConfigure);
datasetRouter.patch("/config/:id", datasetController.updateDatasetConfig);
datasetRouter.post("/export/:id", datasetController.exportFile);
datasetRouter.delete("/delete/:id", datasetController.deleteDataset);
module.exports = datasetRouter;
//# sourceMappingURL=datasetRouter.js.map