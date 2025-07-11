import { and, asc, desc, eq, not } from "drizzle-orm";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { filteredQueueSelect, likes, queue } from "~/drizzle/schemas/queue";
import { isMod } from "~/utils/privileges";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { changedQueueEntrySchema, type Song } from "~/drizzle/types";
import { type RouterOutput } from "./root";
import { type ResultSet } from "@libsql/client";
import { karaokeFilter, songs } from "~/drizzle/schemas/songlist";
import { KARAOKE_TAG } from "~/utils/consts";

export type QueueGetAllOutput = RouterOutput["queue"]["getAll"];

export const queueRouter = createTRPCRouter({
    getAll: privateProcedure.query(async ({ ctx }) => {
        const userLikes = ctx.drizzle
            .select()
            .from(likes)
            .where(eq(likes.userId, ctx.user.id))
            .as("userLikes");

        const data = await ctx.drizzle
            .select()
            .from(queue)
            .orderBy(asc(queue.queueNumber))
            .leftJoin(userLikes, eq(queue.id, userLikes.songId))
            .all();

        const order: number[] = new Array(data.length);

        let index = 0;
        for (const entry of data) {
            const id = entry.queue.id;
            order[index] = id;
            index++;
        }

        return {
            data,
            order,
        };
    }),

    changeOrder: privateProcedure
        .input(z.array(z.number()))
        .mutation(async ({ ctx, input: newOrder }) => {
            if (!isMod(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            const promises: Promise<ResultSet>[] = new Array(newOrder.length);
            let index = 0;
            for (const id of newOrder) {
                promises[index] = ctx.drizzle
                    .update(queue)
                    .set({ queueNumber: index })
                    .where(eq(queue.id, id))
                    .run();
                index++;
            }

            await Promise.all(promises);

            const current = await ctx.drizzle
                .select({ queueNumber: queue.queueNumber })
                .from(queue)
                .where(eq(queue.current, 1))
                .all();
            const currentQueueNumber = current[0]?.queueNumber;
            return currentQueueNumber !== undefined ? currentQueueNumber : -1;
        }),

    getFiltered: publicProcedure.query(async ({ ctx }) => {
        let out: {
            queue: {
                id: number;
                artist: string;
                songName: string;
                donorName: string;
                current: number;
                played: number;
                likeCount: number;
            };
            userLikes: { value: number } | null;
        }[];

        if (ctx.user) {
            const userLikes = ctx.drizzle
                .select()
                .from(likes)
                .where(eq(likes.userId, ctx.user.id))
                .as("userLikes");
            out = await ctx.drizzle
                .select({
                    queue: filteredQueueSelect,
                    userLikes: {
                        value: userLikes.value,
                    },
                })
                .from(queue)
                .where(eq(queue.visible, 1))
                .orderBy(asc(queue.queueNumber))
                .leftJoin(userLikes, eq(queue.id, userLikes.songId))
                .all();
        } else {
            const data = await ctx.drizzle
                .select(filteredQueueSelect)
                .from(queue)
                .where(eq(queue.visible, 1))
                .orderBy(asc(queue.queueNumber))
                .all();
            out = data.map((queue) => ({ queue, userLikes: null }));
        }

        return out;
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
        .input(
            z.object({ id: z.number(), value: z.boolean(), index: z.number() }),
        )
        .mutation(async ({ ctx, input: { id, value, index } }) => {
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

            await ctx.drizzle
                .update(queue)
                .set({ current: value ? 1 : 0 })
                .where(eq(queue.id, id))
                .run();

            return index;
        }),

    deleteAll: privateProcedure.mutation(async ({ ctx }) => {
        if (!isMod(ctx.user.privileges)) {
            throw new TRPCError({ code: "FORBIDDEN" });
        }

        const deletedEntries = await ctx.drizzle
            .delete(queue)
            .where(eq(queue.played, 1))
            .returning()
            .all();

        const getSongPromises: Promise<Song | undefined>[] = [];
        for (const deletedEntry of deletedEntries) {
            if (deletedEntry.played === 0) {
                continue;
            }

            getSongPromises.push(
                ctx.drizzle
                    .select()
                    .from(songs)
                    .where(
                        and(
                            eq(songs.artist, deletedEntry.artist),
                            eq(songs.songName, deletedEntry.songName),
                            deletedEntry.tag.includes(KARAOKE_TAG)
                                ? karaokeFilter
                                : not(karaokeFilter),
                        ),
                    )
                    .limit(1)
                    .get(),
            );
        }

        const songsToAdd: Song[] = [];
        const updateSongPromises: Promise<ResultSet>[] = [];
        let idx = -1;
        for (const result of await Promise.allSettled(getSongPromises)) {
            idx++;
            if (result.status === "rejected") continue;

            const { value: song } = result;
            const deletedEntry = deletedEntries[idx];
            if (!deletedEntry || (!song && deletedEntry.willAdd === 0)) {
                continue;
            }

            if (!song || !song.id) {
                songsToAdd.push({
                    artist: deletedEntry.artist,
                    songName: deletedEntry.songName,
                    likeCount: deletedEntry.likeCount,
                    tag: deletedEntry.tag,
                    playCount: 1,
                    lastPlayed: new Date().toISOString(),
                });
                continue;
            }

            song.playCount = (song.playCount ?? 0) + 1;
            song.likeCount = (song.likeCount ?? 0) + deletedEntry.likeCount;
            song.lastPlayed = new Date().toISOString();
            song.tag = deletedEntry.tag === "" ? song.tag : deletedEntry.tag;

            updateSongPromises.push(
                ctx.drizzle
                    .update(songs)
                    .set(song)
                    .where(eq(songs.id, song.id))
                    .run(),
            );
        }

        if (songsToAdd.length) {
            await Promise.allSettled([
                ...updateSongPromises,
                ctx.drizzle.insert(songs).values(songsToAdd).run(),
            ]);
        } else {
            await Promise.allSettled(updateSongPromises);
        }
    }),

    delete: privateProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input: { id } }) => {
            if (!isMod(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            if (id < 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Incorrect id",
                });
            }

            const deletedEntry = await ctx.drizzle
                .delete(queue)
                .where(eq(queue.id, id))
                .returning()
                .get();
            if (!deletedEntry) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                });
            }

            if (deletedEntry.played === 0) {
                return deletedEntry;
            }

            const song = await ctx.drizzle
                .select({
                    id: songs.id,
                    playCount: songs.playCount,
                    likeCount: songs.likeCount,
                    tag: songs.tag,
                    lastPlayed: songs.lastPlayed,
                })
                .from(songs)
                .where(
                    and(
                        eq(songs.artist, deletedEntry.artist),
                        eq(songs.songName, deletedEntry.songName),
                        deletedEntry.tag.includes(KARAOKE_TAG)
                            ? karaokeFilter
                            : not(karaokeFilter),
                    ),
                )
                .limit(1)
                .get();
            if (!song && deletedEntry.willAdd === 0) {
                return deletedEntry;
            }

            if (!song) {
                return ctx.drizzle
                    .insert(songs)
                    .values({
                        artist: deletedEntry.artist,
                        songName: deletedEntry.songName,
                        likeCount: deletedEntry.likeCount,
                        tag: deletedEntry.tag,
                        playCount: 1,
                        lastPlayed: new Date().toISOString(),
                    })
                    .run();
            }

            song.playCount++;
            song.likeCount += deletedEntry.likeCount;
            song.lastPlayed = new Date().toISOString();
            song.tag = deletedEntry.tag === "" ? song.tag : deletedEntry.tag;

            return ctx.drizzle
                .update(songs)
                .set(song)
                .where(eq(songs.id, song.id))
                .run();
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

    getOverlay: publicProcedure.query(async ({ ctx }) => {
        return await ctx.drizzle
            .select({
                id: queue.id,
                artist: queue.artist,
                songName: queue.songName,
                likeCount: queue.likeCount,
                current: queue.current,
                played: queue.played,
                queueNumber: queue.queueNumber,
            })
            .from(queue)
            .where(eq(queue.visible, 1))
            .orderBy(asc(queue.queueNumber))
            .all();
    }),
});
