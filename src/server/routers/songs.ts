import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { insertSongsSchema, songs } from "~/drizzle/schemas/songlist";
import { TRPCError } from "@trpc/server";
import { isAdmin } from "~/utils/privileges";
import { asc } from "drizzle-orm";

export const songsRouter = createTRPCRouter({
    uploadMany: privateProcedure
        .input(z.array(insertSongsSchema))
        .mutation(({ input, ctx }) => {
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

        const categories = ["Foreign", "Russian", "OST", "Original"];
        const categoriesCounts: number[] = [];
        const artistFirstLetters: string[] = [songList[0].artist[0]];
        let lettersIndex = 0;
        for (const { tag, artist } of songList) {
            if (artist[0] !== artistFirstLetters[lettersIndex]) {
                artistFirstLetters.push(artist[0]);
                lettersIndex++;
            }

            let index = 0;
            for (const category of categories) {
                if (tag.includes(category.toLowerCase())) {
                    categoriesCounts[index] =
                        categoriesCounts[index] === undefined
                            ? 1
                            : categoriesCounts[index] + 1;
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
