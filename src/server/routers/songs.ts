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
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.drizzle
            .select()
            .from(songs)
            .orderBy(asc(songs.artist), asc(songs.songName))
            .all();
    }),
});
