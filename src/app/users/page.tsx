import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HydrateClient } from "~/client/HydrateClient";
// import { redirect } from "next/navigation";
import { SearchableUsersList } from "~/components/client/SearchableUsersList";
import { Spinner } from "~/components/utils/Spinner";
import { serverAPI } from "~/server/api";
import { isAdmin } from "~/utils/privileges";

export const runtime = "edge";

export default async function Users() {
    const user = await serverAPI.getAuth.fetch();
    if (!isAdmin(user?.privileges)) {
        notFound();
        // redirect("/"); internal server error on edge
    }

    return (
        <main className="flex flex-col items-center gap-2 py-2">
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <UsersList />
            </Suspense>
        </main>
    );
}

async function UsersList() {
    await serverAPI.users.getAll.fetch();
    const dehydratedState = await serverAPI.dehydrate();

    return (
        <HydrateClient state={dehydratedState}>
            <SearchableUsersList />
        </HydrateClient>
    );
}
