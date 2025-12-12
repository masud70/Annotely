"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require("express");
const { labelController } = require("../controller/labelController");
const labelRouter = Router();
labelRouter.get("/:id", labelController.getDatasetAndConfig);
labelRouter.post("/update", labelController.updateLabel);
module.exports = labelRouter;
//# sourceMappingURL=labelRouter.js.map