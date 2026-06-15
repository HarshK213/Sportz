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
        return res.status(400).json({
            error: "Invalid match id",
            details: JSON.stringify(parsedParams.error),
        });
    }

    const parsedQuery = listCommentaryQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
        return res.status(400).json({
            error: "Invalid query",
            details: JSON.stringify(parsedQuery.error),
        });
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
        return res.status(500).json({
            error: "Failed to list commentary",
            details: JSON.stringify(err),
        });
    }
});

commentaryRoute.post("/", async (req, res) => {
    const parsedParams = matchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        return res.status(400).json({
            error: "Invalid match id",
            details: JSON.stringify(parsedParams.error),
        });
    }

    const parsedBody = createCommentarySchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            error: "Invalid payload",
            details: JSON.stringify(parsedBody.error),
        });
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

        return res.status(201).json({ data: entry });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to create commentary entry",
            details: JSON.stringify(err),
        });
    }
});
