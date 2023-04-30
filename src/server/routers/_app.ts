/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
    whoami: publicProcedure.query(({ ctx }) => {
        return ctx.user ?? null;
    }),
});

export type AppRouter = typeof appRouter;
