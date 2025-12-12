// src/router/index.ts (CJS)
export {}; // ✅ force module scope

const { Router } = require("express");
const { commonMiddleware } = require("../middleware");

const indexRouter = Router();

indexRouter.get("/", (_req: any, res: any, _next: any) => {
  res.json({
    success: true,
    message: "Success Index Router",
  });
});

indexRouter.post(
  "/upload",
  commonMiddleware.uploadFile,
  commonMiddleware.parseCsvSingle
);

module.exports = indexRouter;
