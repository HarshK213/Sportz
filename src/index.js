import "dotenv/config";
import http from "http";
import { env } from "./config/env.js";
import router from "./routes/index.js";
import { attachWebSocketServer } from "./ws/server.js";
import express from "express";

const port = env.PORT;
const host = env.HOST;

// made express server
const app = express();

/*
  Now we will wrap the express app in a standard http server, allowing both http routes and ws update to co-exist on one port.
*/
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from express server");
});

app.use("/api", router);

app.get("/api/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Sportz API is running" });
});

app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(port, () => {
    const baseUrl =
        host === "0.0.0.0"
            ? `http://localhost:${port}`
            : `http://${host}:${port}`;

    console.log(`Server is running on ${baseUrl}.`);
    console.log(
        `WebSocket Server is running on ${baseUrl.replace("http", "ws")}/ws`
    );
});
