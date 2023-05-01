import type { Adapter } from "@auth/core/adapters";
import { and, eq } from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import {
    accounts,
    sessions,
    users,
    verificationTokens,
} from "~/drizzle/schemas/auth";

export function createDrizzleAdapter(db: LibSQLDatabase): Adapter {
    return {
        async createUser(userData) {
            const row = await db
                .insert(users)
                .values({
                    id: crypto.randomUUID(),
                    email: userData.email,
                    emailVerified: userData.emailVerified,
                    name: userData.name,
                    image: userData.image,
                })
                .returning()
                .get();
            return row;
        },
        async getUser(id) {
            const row = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1)
                .get();
            return row ?? null;
        },
        async getUserByEmail(email) {
            const row = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1)
                .get();
            return row ?? null;
        },
        async getUserByAccount({ providerAccountId, provider }) {
            const row = await db
                .select()
                .from(users)
                .innerJoin(accounts, eq(users.id, accounts.userId))
                .where(
                    and(
                        eq(accounts.providerAccountId, providerAccountId),
                        eq(accounts.provider, provider),
                    ),
                )
                .limit(1)
                .get();
            return row?.users ?? null;
        },
        async updateUser({ id, ...userData }) {
            if (!id) throw new Error("User not found");
            const row = await db
                .update(users)
                .set(userData)
                .where(eq(users.id, id))
                .returning()
                .get();
            return row;
        },
        async deleteUser(userId) {
            await db
                .delete(users)
                .where(eq(users.id, userId))
                .returning()
                .get();
        },
        async linkAccount(account) {
            await db
                .insert(accounts)
                .values({
                    id: crypto.randomUUID(),
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    type: account.type,
                    userId: account.userId,
                    // OpenIDTokenEndpointResponse properties
                    access_token: account.access_token,
                    expires_in: account.expires_in,
                    id_token: account.id_token,
                    refresh_token: account.refresh_token,
                    refresh_token_expires_in:
                        account.refresh_token_expires_in as number, // TODO: why doesn't the account type have this property?
                    scope: account.scope,
                    token_type: account.token_type,
                })
                .returning()
                .get();
        },
        async unlinkAccount({ providerAccountId, provider }) {
            await db
                .delete(accounts)
                .where(
                    and(
                        eq(accounts.providerAccountId, providerAccountId),
                        eq(accounts.provider, provider),
                    ),
                )
                .returning()
                .get();
        },
        async createSession(data) {
            const row = await db
                .insert(sessions)
                .values({
                    id: crypto.randomUUID(),
                    expires: data.expires.toUTCString(),
                    sessionToken: data.sessionToken,
                    userId: data.userId,
                })
                .returning()
                .get();
            return {
                ...row,
                expires: new Date(row.expires),
            };
        },
        async getSessionAndUser(sessionToken) {
            const row = await db
                .select({
                    user: users,
                    session: {
                        id: sessions.id,
                        userId: sessions.userId,
                        sessionToken: sessions.sessionToken,
                        expires: sessions.expires,
                    },
                })
                .from(sessions)
                .innerJoin(users, eq(users.id, sessions.userId))
                .where(eq(sessions.sessionToken, sessionToken))
                .limit(1)
                .get();
            if (!row) return null;
            const { user, session } = row;
            return {
                user,
                session: {
                    id: session.id,
                    userId: session.userId,
                    sessionToken: session.sessionToken,
                    expires: new Date(session.expires),
                },
            };
        },
        async updateSession(session) {
            const row = await db
                .update(sessions)
                .set({
                    ...session,
                    expires: session.expires?.toUTCString(),
                })
                .where(eq(sessions.sessionToken, session.sessionToken))
                .returning()
                .get();
            return {
                ...row,
                expires: new Date(row.expires),
            };
        },
        async deleteSession(sessionToken) {
            await db
                .delete(sessions)
                .where(eq(sessions.sessionToken, sessionToken))
                .returning()
                .get();
        },
        async createVerificationToken(verificationToken) {
            const row = await db
                .insert(verificationTokens)
                .values({
                    expires: verificationToken.expires.toUTCString(),
                    identifier: verificationToken.identifier,
                    token: verificationToken.token,
                })
                .returning()
                .get();
            return {
                ...row,
                expires: new Date(row.expires),
            };
        },
        async useVerificationToken({ identifier, token }) {
            // First get the token while it still exists
            const row = await db
                .select()
                .from(verificationTokens)
                .where(eq(verificationTokens.token, token))
                .limit(1)
                .get();
            if (!row) return null;
            // Then delete it.
            await db
                .delete(verificationTokens)
                .where(
                    and(
                        eq(verificationTokens.token, token),
                        eq(verificationTokens.identifier, identifier),
                    ),
                )
                .returning()
                .get();
            // Then return it.
            return {
                ...row,
                expires: new Date(row.expires),
            };
        },
    };
}
