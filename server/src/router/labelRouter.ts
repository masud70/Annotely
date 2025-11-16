// src/router/labelRouter.ts
import { Router } from "express";
import { labelController } from "../controller/labelController.ts";

const labelRouter = Router();

labelRouter.get("/:id", labelController.getDatasetAndConfig);

labelRouter.post("/update", labelController.updateLabel);

export default labelRouter;
