import { cookies } from "next/headers";
import superjson from "superjson";
import { createGetUser } from "~/auth/getUser";
import { createContext } from "~/server/context";
import { createTRPCNextLayout } from "./createTRPCNextLayout";
import { appRouter } from "./routers/root";

export const serverAPI = createTRPCNextLayout({
    router: appRouter,
    transformer: superjson,
    createContext() {
        return createContext({
            type: "rsc",
            getUser: createGetUser(cookies()),
        });
    },
});
