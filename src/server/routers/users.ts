import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { users } from "~/drizzle/schemas/auth";
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
                .run();
        }),
});
