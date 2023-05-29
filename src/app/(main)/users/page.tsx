import { Suspense } from "react";
import { HydrateClient } from "~/client/HydrateClient";
import { redirect } from "next/navigation";
import { Spinner } from "~/components/utils/Spinner";
import { serverAPI } from "~/server/api";
import { isAdmin } from "~/utils/privileges";
import { SearchableUsersList } from "~/components/client/users/SearchableUsersList";

export const runtime = "edge";

export const metadata = {
    title: "Users edit",
};

export default async function Users() {
    const user = await serverAPI.getAuth.fetch();
    if (!isAdmin(user?.privileges)) {
        redirect("/");
    }

    return (
        <>
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <UsersList />
            </Suspense>
        </>
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
