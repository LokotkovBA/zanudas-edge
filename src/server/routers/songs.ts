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

        const filterValues = ["Foreign", "Russian", "OST", "Original"];
        const filterCount: number[] = [];
        for (const { tag } of songList) {
            let index = 0;
            for (const filter of filterValues) {
                const lowerFilter = filter.toLowerCase();
                if (tag.includes(lowerFilter)) {
                    filterCount[index] =
                        filterCount[index] === undefined
                            ? 1
                            : filterCount[index] + 1;
                }
                index++;
            }
        }
        return { songList, filterValues, filterCount };
    }),
});
