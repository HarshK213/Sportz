import { Router } from "express";
import { matchRouter } from "./matches.js";

const router = Router();

router.use("/match", matchRouter);

export default router;