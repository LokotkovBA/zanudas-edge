import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { users } from "~/drizzle/schemas/auth";
import { eq } from "drizzle-orm";
import { isMaster } from "~/utils/privileges";

export const usersRouter = createTRPCRouter({
    updatePrivileges: privateProcedure
        .input(z.object({ user_id: z.string(), privileges: z.number() }))
        .mutation(({ ctx, input: { user_id, privileges } }) => {
            if (!isMaster(ctx.user.privileges)) throw new TRPCError({ code: "FORBIDDEN" });
            return ctx.drizzle
                .update(users)
                .set({ privileges })
                .where(eq(users.id, user_id))
                .run();
        }),
});
