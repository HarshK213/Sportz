import { Router } from "express";
import { matchRouter } from "./matches.route.js";
import { commentaryRoute } from "./commentary.route.js";

const router = Router();

router.use("/match", matchRouter);
router.use("/match/:id/commentary", commentaryRoute);

export default router;
