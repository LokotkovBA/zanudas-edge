import TwitchProvider from "@auth/core/providers/twitch";
import { drizzleClient } from "~/drizzle/db";
import { createDrizzleAdapter } from "./adapters/drizzle-orm";
import { type SolidAuthConfig } from "./server";
import { env } from "~/env.mjs";
import { users } from "~/drizzle/schemas/auth";
import { eq } from "drizzle-orm";

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
        async signIn({ user, profile }) {
            try {
                await drizzleClient
                    .update(users)
                    .set({
                        name: profile?.preferred_username ?? undefined,
                        image: profile?.picture ?? undefined,
                        email: profile?.email ?? undefined,
                    })
                    .where(eq(users.id, user.id))
                    .run();
            } catch (e) {
                console.error(`Error when updating user ${user.name}\n`, e);
            } finally {
                return true;
            }
        },
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
