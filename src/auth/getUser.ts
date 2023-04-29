import { eq } from "drizzle-orm";
import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { drizzleClient } from "~/drizzle/db";
import { sessions, users } from "~/drizzle/schemas/auth";

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string | undefined;
}

export type UserRole = "CHATTER" | "MOD" | "ADMIN";

export type GetUser = () => Promise<User | null>;

export function createGetUser(
    cookies: RequestCookies | ReadonlyRequestCookies,
) {
    return async () => {
        const newCookies = cookies.getAll().reduce((cookiesObj, cookie) => {
            cookiesObj[cookie.name] = cookie.value;
            return cookiesObj;
        }, {} as Record<string, string>);

        const sessionToken =
            newCookies["next-auth.session-token"] ??
            newCookies["__Secure-next-auth.session-token"];
        if (!sessionToken) return null;

        const rows = await drizzleClient
            .select({
                user_id: users.id,
                user_name: users.name,
                user_role: users.role,
                user_email: users.email,
            })
            .from(sessions)
            .innerJoin(users, eq(users.id, sessions.userId))
            .limit(1)
            .all();
        const session = rows[0];
        if (!session) return null;
        if (!isUserRole(session.user_role)) throw Error("Invalid user role in db");

        const user: User = {
            id: session.user_id,
            name: session.user_name ?? undefined,
            role: session.user_role,
            email: session.user_email,
        };
        return user;
    };
}


function isUserRole(input: string): input is UserRole {
    return ["CHATTER", "MOD", "ADMIN"].includes(input);
}
