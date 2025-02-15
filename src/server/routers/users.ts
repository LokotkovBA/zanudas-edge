import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { accounts, sessions, users } from "~/drizzle/schemas/auth";
import { eq } from "drizzle-orm";
import { isAdmin, isMaster } from "~/utils/privileges";

export const usersRouter = createTRPCRouter({
    getAll: privateProcedure.query(({ ctx }) => {
        if (!isAdmin(ctx.user.privileges)) {
            throw new TRPCError({ code: "FORBIDDEN" });
        }

        return ctx.drizzle
            .select({
                id: users.id,
                image: users.image,
                name: users.name,
                privileges: users.privileges,
            })
            .from(users)
            .all();
    }),

    deleteUser: privateProcedure
        .input(z.object({ user_id: z.string() }))
        .mutation(async ({ ctx, input: { user_id } }) => {
            if (!isMaster(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            await ctx.drizzle
                .delete(sessions)
                .where(eq(sessions.userId, user_id))
                .run();
            await ctx.drizzle
                .delete(accounts)
                .where(eq(accounts.userId, user_id))
                .run();
            return ctx.drizzle
                .delete(users)
                .where(eq(users.id, user_id))
                .returning()
                .run();
        }),

    updatePrivileges: privateProcedure
        .input(z.object({ user_id: z.string(), privileges: z.number() }))
        .mutation(({ ctx, input: { user_id, privileges } }) => {
            if (!isMaster(ctx.user.privileges)) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.drizzle
                .update(users)
                .set({ privileges })
                .where(eq(users.id, user_id))
                .returning()
                .run();
        }),
});
