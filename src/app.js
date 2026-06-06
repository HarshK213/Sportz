import express from "express";
import router from "./routes/index.js";

// made express server
const app = express();

// using middlewares
app.use(express.json());

// defining routes
/* Route for checking server health */
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Sportz API is running" });
});

/* Route for other services */
app.use("/api", router);

/* Response if invalid route is given  */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
