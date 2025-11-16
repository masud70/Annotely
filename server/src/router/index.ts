// src/router/index.ts
import { Router, Request, Response, NextFunction } from "express";
import { commonMiddleware } from "../middleware/index.ts";
import { DB } from "../lib/db.ts";

const indexRouter = Router();
const db = new DB({ fileId: 1763020042035 });

indexRouter.get("/", (_req: Request, res: Response, _next: NextFunction) => {
	res.json({
		success: true,
		message: "Success Index Router",
		data: db._rows || "Undefined",
	});
});

indexRouter.post("/upload", commonMiddleware.uploadFile, commonMiddleware.parseCsvSingle);

export default indexRouter;
