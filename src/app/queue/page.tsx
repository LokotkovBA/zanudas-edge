import { Suspense } from "react";
import { HydrateClient } from "~/client/HydrateClient";
import { AddButton } from "~/components/client/queue/AddButton";
import { QueueList } from "~/components/client/queue/QueueList";
import { Spinner } from "~/components/utils/Spinner";
import { serverAPI } from "~/server/api";
import { isMod } from "~/utils/privileges";

export const runtime = "edge";

export default async function Queue() {
    const userData = await serverAPI.getAuth.fetch();

    return (
        <main className="flex flex-col items-center gap-2 py-2">
            {isMod(userData?.privileges) && <AddButton />}
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <List />
            </Suspense>
        </main>
    );
}

async function List() {
    await serverAPI.queue.getAll.fetch();
    const state = await serverAPI.dehydrate();

    return (
        <HydrateClient state={state}>
            <QueueList />
        </HydrateClient>
    );
}
