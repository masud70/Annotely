"use strict";
// src/server.ts (CommonJS style)
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server: SocketIOServer } = require("socket.io");
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const labelRouter = require("./router/labelRouter");
const indexRouter = require("./router/index");
const { commonMiddleware } = require("./middleware");
const codeRouter = require("./router/codeRouter");
const datasetRouter = require("./router/datasetRouter");
const app = express();
// Middleware
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use("/", indexRouter);
app.use("/label", labelRouter);
app.use("/code", codeRouter);
app.use("/dataset", datasetRouter);
app.use(commonMiddleware.errorMiddleware);
// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    path: "/ws",
    cors: { origin: CLIENT_ORIGIN, credentials: true },
});
io.on("connection", (socket) => {
    console.log("🔌 socket connected:", socket.id);
    socket.on("ping", () => socket.emit("pong"));
    socket.on("broadcast", (msg) => {
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
module.exports = { app, io, httpServer };
//# sourceMappingURL=server.js.map