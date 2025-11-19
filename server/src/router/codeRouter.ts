// src/router/labelRouter.ts
import { Router } from "express";
import { labelController } from "../controller/labelController.ts";

const codeRouter = Router();

codeRouter.post("/updateCode", labelController.updateCode);
codeRouter.post("/updateTheme", labelController.updateTheme);

export default codeRouter;
