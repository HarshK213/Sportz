import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { matchIdParamSchema } from "../validations/matchSchemas.js";
import {
    createCommentarySchema,
    listCommentaryQuerySchema,
} from "../validations/commentary.js";
import { commentary } from "../models/schema.js";
import { db } from "../config/db.js";

const MAX_LIMIT = 100;

export const commentaryRoute = Router({ mergeParams: true });

commentaryRoute.get("/", async (req, res) => {
    const parsedParams = matchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        console.error("Invalid match id params:", parsedParams.error);
        return res.status(400).json({ error: "Invalid match id" });
    }

    const parsedQuery = listCommentaryQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
        console.error("Invalid query params:", parsedQuery.error);
        return res.status(400).json({ error: "Invalid query" });
    }

    const limit = Math.min(parsedQuery.data.limit ?? 100, MAX_LIMIT);

    try {
        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, parsedParams.data.id))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        return res.status(200).json({ data });
    } catch (err) {
        console.error("Failed to list commentary:", err);
        return res.status(500).json({ error: "Failed to list commentary" });
    }
});

commentaryRoute.post("/", async (req, res) => {
    const parsedParams = matchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        console.error("Invalid match id params:", parsedParams.error);
        return res.status(400).json({ error: "Invalid match id" });
    }

    const parsedBody = createCommentarySchema.safeParse(req.body);
    if (!parsedBody.success) {
        console.error("Invalid payload:", parsedBody.error);
        return res.status(400).json({ error: "Invalid payload" });
    }

    const { minutes, ...rest } = parsedBody.data;

    try {
        const [entry] = await db
            .insert(commentary)
            .values({
                matchId: parsedParams.data.id,
                minute: minutes,
                ...rest,
            })
            .returning();

        if (res.app.locals.broadcastCommentary) {
            res.app.locals.broadcastCommentary(entry.matchId, entry);
        }
        
        return res.status(201).json({ data: entry });
    } catch (err) {
        console.error("Failed to create commentary entry:", err);
        const pgCode = err.code ?? err.cause?.code;
        if (pgCode === "23503") {
            return res.status(404).json({ error: "Referenced match does not exist" });
        }
        return res.status(500).json({ error: "Failed to create commentary entry" });
    }
});
