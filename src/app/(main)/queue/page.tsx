import { type Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HydrateClient } from "~/client/HydrateClient";
import { AddButton } from "~/components/client/queue/AddButton";
import { AdminButton } from "~/components/client/queue/AdminButton";
import { DAControl } from "~/components/client/queue/DAControl";
import { ModView } from "~/components/client/queue/ModView";
import { PlebView } from "~/components/client/queue/PlebView";
import { QueueSocketsSub } from "~/components/client/queue/QueueSocketsSub";
import { Spinner } from "~/components/utils/Spinner";
import { serverAPI } from "~/server/api";
import DonationAlertsIcon from "~/svg/DonationAlertsIcon";
import { isMod } from "~/utils/privileges";

export const runtime = "edge";
export const preferredRegion = "arn1";

export async function generateMetadata(): Promise<Metadata> {
    const queueData = await serverAPI.queue.getFiltered.fetch();
    let title = "";

    for (const entry of queueData) {
        if (entry.queue.current) {
            title = `${entry.queue.artist} - ${entry.queue.songName}`;
            break;
        }
    }

    if (!title) {
        title = "Zanuda's queue";
    }

    return {
        title,
    };
}

export default async function Queue() {
    const userData = await serverAPI.getAuth.fetch();

    return (
        <>
            {isMod(userData?.privileges) && userData?.encUser && (
                <>
                    <menu className="flex items-center gap-2">
                        <li>
                            <AdminButton />
                        </li>
                        <li>
                            <AddButton />
                        </li>
                        <li>
                            <DAControl encUser={userData.encUser} />
                        </li>
                    </menu>
                    <Suspense fallback={<Spinner />}>
                        {/* @ts-expect-error Async Server Component */}
                        <ModPart />
                    </Suspense>
                </>
            )}
            {!isMod(userData?.privileges) && (
                <Suspense fallback={<Spinner />}>
                    {/* @ts-expect-error Async Server Component */}
                    <PlebPart />
                </Suspense>
            )}
            <QueueSocketsSub privileges={userData?.privileges} />
        </>
    );
}

async function ModPart() {
    const queueData = await serverAPI.queue.getAll.fetch();

    if (!queueData.order.length) {
        return <EmptyQueue />;
    }

    const state = await serverAPI.dehydrate();
    return (
        <HydrateClient state={state}>
            <ModView />
        </HydrateClient>
    );
}

async function PlebPart() {
    const filteredQueueData = await serverAPI.queue.getFiltered.fetch();

    if (!filteredQueueData.length) {
        return <EmptyQueue />;
    }

    const state = await serverAPI.dehydrate();
    return (
        <ul className="flex flex-col rounded border border-slate-400 bg-slate-950 px-5 py-1">
            <HydrateClient state={state}>
                <PlebView />
            </HydrateClient>
        </ul>
    );
}

function EmptyQueue() {
    return (
        <h2 className="flex items-center gap-1">
            Queue is empty.
            <Link
                target="_blank"
                className="flex items-center justify-center gap-1 rounded fill-slate-50 px-1 py-2 hover:bg-slate-950"
                href="https://www.donationalerts.com/r/zanuda"
            >
                <DonationAlertsIcon size={"1.2em"} />
                Request
            </Link>
        </h2>
    );
}
