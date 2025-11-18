// src/router/labelRouter.ts
import { Router } from "express";
import { labelController } from "../controller/labelController.ts";

const codeRouter = Router();

codeRouter.post("/update", labelController.updateCode);

export default codeRouter;
