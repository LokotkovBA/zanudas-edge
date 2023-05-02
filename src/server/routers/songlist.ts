import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { insertSongsSchema, songs } from "~/drizzle/schemas/songlist";
import { TRPCError } from "@trpc/server";
import { isAdmin } from "~/utils/privileges";

export const songlistRouter = createTRPCRouter({
    uploadMany: privateProcedure
        .input(z.array(insertSongsSchema))
        .mutation(({ input, ctx }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle.insert(songs).values(input).returning().get();
        }),
});
