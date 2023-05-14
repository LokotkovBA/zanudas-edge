import { and, asc, desc, eq } from "drizzle-orm";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { likes, queue } from "~/drizzle/schemas/queue";
import { isMod } from "~/utils/privileges";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    type QueueEntry,
    type LikeEntry,
    changedQueueEntrySchema,
} from "~/drizzle/types";

export const queueRouter = createTRPCRouter({
    getAll: privateProcedure.query(async ({ ctx }) => {
        const userLikes = ctx.drizzle
            .select()
            .from(likes)
            .where(eq(likes.userId, ctx.user.id))
            .as("userLikes");

        return ctx.drizzle
            .select()
            .from(queue)
            .orderBy(asc(queue.queueNumber))
            .leftJoin(userLikes, eq(queue.id, userLikes.songId))
            .all();
    }),

    getFiltered: publicProcedure.query(async ({ ctx }) => {
        let out: {
            queue: QueueEntry;
            userLikes: LikeEntry | null;
        }[];

        if (ctx.user) {
            const userLikes = ctx.drizzle
                .select()
                .from(likes)
                .where(eq(likes.userId, ctx.user.id))
                .as("userLikes");
            out = await ctx.drizzle
                .select()
                .from(queue)
                .orderBy(asc(queue.queueNumber))
                .leftJoin(userLikes, eq(queue.id, userLikes.songId))
                .all();
        } else {
            const data = await ctx.drizzle
                .select()
                .from(queue)
                .orderBy(asc(queue.queueNumber))
                .all();
            out = data.map((queue) => ({ queue, userLikes: null }));
        }

        return out.filter((entry) => entry.queue.visible);
    }),

    like: privateProcedure
        .input(z.object({ songId: z.number(), value: z.number() }))
        .mutation(async ({ ctx, input: { songId, value } }) => {
            if (
                await ctx.drizzle
                    .select()
                    .from(likes)
                    .where(
                        and(
                            eq(likes.userId, ctx.user.id),
                            eq(likes.songId, songId),
                        ),
                    )
                    .get()
            ) {
                await ctx.drizzle
                    .update(likes)
                    .set({ value })
                    .where(
                        and(
                            eq(likes.userId, ctx.user.id),
                            eq(likes.songId, songId),
                        ),
                    )
                    .run();
                return value;
            }

            await ctx.drizzle
                .insert(likes)
                .values({ songId, value, userId: ctx.user.id })
                .run();
            return value;
        }),

    change: privateProcedure
        .input(changedQueueEntrySchema)
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

    setCurrent: privateProcedure
        .input(z.object({ id: z.number(), value: z.boolean() }))
        .mutation(async ({ ctx, input: { id, value } }) => {
            if (!isMod(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            if (id < 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Incorrect id",
                });
            }

            if (value) {
                await ctx.drizzle.update(queue).set({ current: 0 }).run();
            }

            return ctx.drizzle
                .update(queue)
                .set({ current: value ? 1 : 0 })
                .where(eq(queue.id, id))
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
