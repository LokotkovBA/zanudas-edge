import { asc, desc, eq } from "drizzle-orm";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { insertQueueSchema, queue } from "~/drizzle/schemas/queue";
import { isMod } from "~/utils/privileges";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const queueRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.drizzle
            .select()
            .from(queue)
            .orderBy(asc(queue.queueNumber))
            .all();
    }),

    change: privateProcedure
        .input(insertQueueSchema)
        .mutation(({ ctx, input }) => {
            if (!isMod(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            if (!input?.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Incorrect id",
                });
            }

            return ctx.drizzle
                .update(queue)
                .set(input)
                .where(eq(queue.id, input.id))
                .run();
        }),

    delete: privateProcedure
        .input(z.object({ id: z.number() }))
        .mutation(({ ctx, input: { id } }) => {
            if (!isMod(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            if (id < 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Incorrect id",
                });
            }

            return ctx.drizzle.delete(queue).where(eq(queue.id, id)).run();
        }),

    add: privateProcedure
        .input(
            z.object({
                artist: z.string(),
                songName: z.string(),
                tag: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (!isMod(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            const queueData = (await ctx.drizzle
                .select({ queueNumber: queue.queueNumber })
                .from(queue)
                .orderBy(desc(queue.queueNumber))
                .limit(1)
                .get()) ?? { queueNumber: 0 };

            return ctx.drizzle
                .insert(queue)
                .values({
                    ...input,
                    queueNumber: queueData.queueNumber + 1,
                })
                .returning()
                .get();
        }),
});
