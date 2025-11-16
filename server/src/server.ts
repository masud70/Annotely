// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

import labelRouter from "./router/labelRouter.ts";
import indexRouter from "./router/index.ts";
import { commonMiddleware } from "./middleware/index.ts";
import filesRouter from "./router/datasetRouter.ts";

const app = express();

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.use("/", indexRouter);
app.use("/label", labelRouter);
app.use("/dataset", filesRouter);

app.use(commonMiddleware.errorMiddleware);

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
	path: "/ws", // client connects to ws://host:PORT/ws
	cors: { origin: CLIENT_ORIGIN, credentials: true },
});

io.on("connection", (socket) => {
	console.log("🔌 socket connected:", socket.id);

	socket.on("ping", () => socket.emit("pong"));
	socket.on("broadcast", (msg) => {
		// broadcast to everyone (including sender)
		io.emit("message", msg);
	});

	socket.on("disconnect", (reason) => {
		console.log("🔌 socket disconnected:", socket.id, reason);
	});
});

// Start server
httpServer.listen(PORT, () => {
	console.log(`🚀 Server is running!`);
	console.log(`🚀 API:     http://localhost:${PORT}`);
	console.log(`🔁 Socket: ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
function shutdown() {
	console.log("\nShutting down...");
	io.close(() => {
		httpServer.close(() => process.exit(0));
	});
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// (Optional) export for testing
export { app, io, httpServer };
