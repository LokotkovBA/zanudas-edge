import { cookies } from "next/headers";
import superjson from "superjson";
import { createGetUser } from "~/auth/getUser";
import { createContext } from "~/server/context";
import { appRouter } from "~/server/routers/_app";
import { createTRPCNextLayout } from "./createTRPCNextLayout";

export const api = createTRPCNextLayout({
    router: appRouter,
    transformer: superjson,
    createContext() {
        return createContext({
            type: "rsc",
            getUser: createGetUser(cookies()),
        });
    },
});
