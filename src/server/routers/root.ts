/**
 * This file contains the root router of your tRPC-backend
 */
import { createTRPCRouter, publicProcedure } from "../trpc";
import { queueRouter } from "./queue";
import { songsRouter } from "./songs";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
    users: usersRouter,
    songlist: songsRouter,
    queue: queueRouter,
    getAuth: publicProcedure.query(({ ctx }) => {
        return ctx.user ?? null;
    }),
});

export type AppRouter = typeof appRouter;
