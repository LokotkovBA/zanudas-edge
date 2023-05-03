/**
 * This file contains the root router of your tRPC-backend
 */
import { createTRPCRouter, publicProcedure } from "../trpc";
import { songsRouter } from "./songs";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
    users: usersRouter,
    songlist: songsRouter,
    getAuth: publicProcedure.query(({ ctx }) => {
        return ctx.user ?? null;
    }),
});

export type AppRouter = typeof appRouter;
