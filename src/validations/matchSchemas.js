import { z } from "zod";

export const MATCH_STATUS = Object.freeze({
    SCHEDULED: "scheduled",
    LIVE: "live",
    FINISHED: "finished",
});

export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const isoDateRefine = (val) => !isNaN(Date.parse(val));

export const createMatchSchema = z
    .object({
        sport: z.string().min(1),
        homeTeam: z.string().min(1),
        awayTeam: z.string().min(1),
        startTime: z
            .string()
            .refine(isoDateRefine, { message: "Invalid ISO date string" }),
        endTime: z
            .string()
            .refine(isoDateRefine, { message: "Invalid ISO date string" }),
        homeScore: z.coerce.number().int().nonnegative().optional(),
        awayScore: z.coerce.number().int().nonnegative().optional(),
    })
    .superRefine((data, ctx) => {
        if (new Date(data.endTime) <= new Date(data.startTime)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "endTime must be after startTime",
                path: ["endTime"],
            });
        }
    });

export const updateScoreSchema = z.object({
    homeScore: z.coerce.number().int().nonnegative(),
    awayScore: z.coerce.number().int().nonnegative(),
});
