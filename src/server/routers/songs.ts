import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { insertSongsSchema, songs } from "~/drizzle/schemas/songlist";
import { TRPCError } from "@trpc/server";
import { isAdmin } from "~/utils/privileges";
import { asc, eq } from "drizzle-orm";

export const songsRouter = createTRPCRouter({
    uploadMany: privateProcedure
        .input(z.array(insertSongsSchema))
        .mutation(({ input, ctx }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle.insert(songs).values(input).returning().get();
        }),

    deleteSong: privateProcedure
        .input(z.object({ id: z.number() }))
        .mutation(({ ctx, input: { id } }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            if (id < 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Incorrect id",
                });
            }

            return ctx.drizzle
                .delete(songs)
                .where(eq(songs.id, id))
                .returning()
                .get();
        }),

    changeSong: privateProcedure
        .input(
            z.object({
                id: z.number(),
                artist: z.string(),
                songName: z.string(),
                tag: z.string(),
            }),
        )
        .mutation(({ ctx, input }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            if (input.id < 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Incorrect id",
                });
            }

            return ctx.drizzle
                .update(songs)
                .set(input)
                .where(eq(songs.id, input.id))
                .returning()
                .get();
        }),

    addSong: privateProcedure
        .input(
            z.object({
                artist: z.string(),
                songName: z.string(),
                tag: z.string(),
            }),
        )
        .mutation(({ ctx, input }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle.insert(songs).values(input).returning().get();
        }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        const songList = await ctx.drizzle
            .select()
            .from(songs)
            .orderBy(asc(songs.artist), asc(songs.songName))
            .all();

        const firstArtistFirstLetter = songList[0]?.artist[0];
        if (!firstArtistFirstLetter) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "First artist first letter doesn't exist",
            });
        }

        const categories = ["Foreign", "Russian", "OST", "Original"];
        const categoriesCounts: number[] = [];
        const artistFirstLetters: string[] = [firstArtistFirstLetter];
        let lettersIndex = 0;
        for (const { tag, artist } of songList) {
            if (artist[0] && artist[0] !== artistFirstLetters[lettersIndex]) {
                artistFirstLetters.push(artist[0]);
                lettersIndex++;
            }

            let index = 0;
            for (const category of categories) {
                if (tag.includes(category.toLowerCase())) {
                    const currentCount = categoriesCounts[index];
                    categoriesCounts[index] =
                        currentCount === undefined ? 1 : currentCount + 1;
                }
                index++;
            }
        }
        return {
            songList,
            categories,
            categoriesCounts,
            artistFirstLetters,
        };
    }),
});
