/**
 * This file contains the root router of your tRPC-backend
 */
import { createTRPCRouter, publicProcedure } from "../trpc";
import { songlistRouter } from "./songlist";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
    users: usersRouter,
    songlist: songlistRouter,
    getAuth: publicProcedure.query(({ ctx }) => {
        return ctx.user ?? null;
    }),
});

export type AppRouter = typeof appRouter;
