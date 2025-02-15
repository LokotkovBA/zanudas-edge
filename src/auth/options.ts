import TwitchProvider from "@auth/core/providers/twitch";
import { drizzleClient } from "~/drizzle/db";
import { createDrizzleAdapter } from "./adapters/drizzle-orm";
import { type SolidAuthConfig } from "./server";
import { env } from "~/env.mjs";

export const authConfig: SolidAuthConfig = {
    // Configure one or more authentication providers
    adapter: createDrizzleAdapter(drizzleClient),
    providers: [
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore growing pains
        TwitchProvider({
            clientId: env.TWITCH_CLIENT_ID,
            clientSecret: env.TWITCH_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    session: {
        strategy: "database",
    },
};
