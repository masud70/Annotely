// src/router/labelRouter.ts (CJS)
export {}; // ✅ force module scope (prevents redeclare errors)

const { Router } = require("express");
const labelController = require("../controller/labelController");

const labelRouter = Router();

labelRouter.get("/:id", labelController.getDatasetAndConfig);
labelRouter.post("/update", labelController.updateLabel);

module.exports = labelRouter;
