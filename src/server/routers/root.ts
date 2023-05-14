/**
 * This file contains the root router of your tRPC-backend
 */
import { encrypt } from "../encryption";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { queueRouter } from "./queue";
import { songsRouter } from "./songs";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
    users: usersRouter,
    songlist: songsRouter,
    queue: queueRouter,
    getAuth: publicProcedure.query(({ ctx }) => {
        if (!ctx.user) {
            return null;
        }

        return {
            ...ctx.user,
            encUser: ctx.user
                ? encrypt(
                      `${ctx.user.name}//${Date.now()}//${ctx.user.privileges}`,
                  )
                : undefined,
        };
    }),
});

export type AppRouter = typeof appRouter;
