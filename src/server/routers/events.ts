import { and, asc, gte, lte } from "drizzle-orm";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { events, insertEventsSchema } from "~/drizzle/schemas/events";
import { z } from "zod";
import { isAdmin } from "~/utils/privileges";
import { TRPCError } from "@trpc/server";

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
                    // .where(
                    //     and(
                    //         lte(events.startTimestamp, weekStartTimestamp),
                    //         gte(events.endTimestamp, weekEndTimestamp),
                    //     ),
                    // )
                    .orderBy(asc(events.startTimestamp))
                    .all();
                console.log(weekStartTimestamp);
                console.log(weekEndTimestamp);
                return eventsData.map(
                    ({
                        id,
                        startTimestamp,
                        endTimestamp,
                        title,
                        modifier,
                        description,
                    }) => {
                        const startDate = new Date();
                        startDate.setTime(startTimestamp);
                        const endDate = new Date();
                        endDate.setTime(endTimestamp);
                        return {
                            id,
                            startDate,
                            endDate,
                            title,
                            description,
                            modifier,
                        };
                    },
                );
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
});
