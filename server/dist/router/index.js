"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require("express");
const { commonMiddleware } = require("../middleware");
const indexRouter = Router();
indexRouter.get("/", (_req, res, _next) => {
    res.json({
        success: true,
        message: "Success Index Router",
    });
});
indexRouter.post("/upload", commonMiddleware.uploadFile, commonMiddleware.parseCsvSingle);
module.exports = indexRouter;
//# sourceMappingURL=index.js.map