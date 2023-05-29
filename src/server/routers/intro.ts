import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { isAdmin } from "~/utils/privileges";
import { insertIntroSchema, intro } from "~/drizzle/schemas/intro";
import { eq } from "drizzle-orm";

export const introRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.drizzle.select().from(intro).all();
    }),

    delete: privateProcedure
        .input(z.number())
        .mutation(({ ctx, input: id }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle.delete(intro).where(eq(intro.id, id)).run();
        }),

    add: privateProcedure
        .input(insertIntroSchema)
        .mutation(({ ctx, input }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle.insert(intro).values(input).run();
        }),

    change: privateProcedure
        .input(
            z.object({
                id: z.number(),
                mainMessage: z.string(),
                preMessage: z.string(),
                symbol: z.string(),
                progress: z.number().nullable(),
            }),
        )
        .mutation(({ ctx, input }) => {
            if (!isAdmin(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle
                .update(intro)
                .set(input)
                .where(eq(intro.id, input.id))
                .run();
        }),
});
