import { and, asc, eq, gte, lte } from "drizzle-orm";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { events, insertEventsSchema } from "~/drizzle/schemas/events";
import { z } from "zod";
import { isAdmin } from "~/utils/privileges";
import { TRPCError } from "@trpc/server";
import { isEventModifier, type EventEntry } from "~/utils/types/schedule";

export const eventsRouter = createTRPCRouter({
    getWeek: publicProcedure
        .input(
            z.object({
                weekStartTimestamp: z.number(),
                weekEndTimestamp: z.number(),
            }),
        )
        .query(
            async ({
                ctx,
                input: { weekStartTimestamp, weekEndTimestamp },
            }) => {
                const eventsData = await ctx.drizzle
                    .select()
                    .from(events)
                    .where(
                        and(
                            gte(events.startTimestamp, weekStartTimestamp),
                            lte(events.endTimestamp, weekEndTimestamp),
                        ),
                    )
                    .orderBy(asc(events.startTimestamp))
                    .all();

                const out: EventEntry[] = [];
                for (const {
                    id,
                    startTimestamp,
                    endTimestamp,
                    title,
                    modifier,
                    description,
                } of eventsData) {
                    if (!isEventModifier(modifier)) {
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
                    }

                    const startDate = new Date(startTimestamp);
                    const endDate = new Date(endTimestamp);

                    out.push({
                        id,
                        startDate,
                        endDate,
                        title,
                        description,
                        modifier,
                    });
                }

                return out;
            },
        ),
    add: privateProcedure
        .input(insertEventsSchema)
        .mutation(({ ctx, input }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle.insert(events).values(input).run();
        }),

    change: privateProcedure
        .input(
            z.object({
                id: z.number(),
                title: z.string(),
                description: z.string().optional(),
                modifier: z.string(),
                startTimestamp: z.number(),
                endTimestamp: z.number(),
            }),
        )
        .mutation(({ ctx, input }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle
                .update(events)
                .set(input)
                .where(eq(events.id, input.id))
                .run();
        }),

    delete: privateProcedure.input(z.number()).mutation(({ ctx, input }) => {
        if (!isAdmin(ctx.user.privileges)) {
            throw new TRPCError({ code: "FORBIDDEN" });
        }

        return ctx.drizzle.delete(events).where(eq(events.id, input)).run();
    }),
});
