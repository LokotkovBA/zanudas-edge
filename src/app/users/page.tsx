import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HydrateClient } from "~/client/HydrateClient";
// import { redirect } from "next/navigation";
import { SearchableUsersList } from "~/components/client/SearchableUsersList";
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
function Spinner() {
    return (
        <div className="h-20 w-20 animate-spin rounded-[50%] border-8 border-slate-950 border-t-sky-400" />
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
