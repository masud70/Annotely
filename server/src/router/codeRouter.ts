// src/router/codeRouter.ts
export {};
const { Router } = require("express");
const labelController = require("../controller/labelController");

const codeRouter = Router();

codeRouter.post("/updateCode", labelController.updateCode);
codeRouter.post("/updateTheme", labelController.updateTheme);
codeRouter.post("/updateNote", labelController.updateNote);

module.exports = codeRouter;
