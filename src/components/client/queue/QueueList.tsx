"use client";
import Link from "next/link";
import { clientAPI } from "~/client/ClientProvider";
import DonationAlertsIcon from "~/svg/DonationAlertsIcon";
import { isMod } from "~/utils/privileges";
import { ModView } from "./ModView";
import { type LikeEntry, type QueueEntry } from "~/drizzle/types";
import clsx from "clsx";
import { LikeBlock } from "./LikeBlock";

export function QueueList({ privileges }: { privileges: number }) {
    const { data: queueData } = clientAPI.queue.getAll.useQuery();

    const filteredQueueData = queueData?.filter((entry) => entry.queue.visible);

    if (
        (!isMod(privileges) && !filteredQueueData?.length) ||
        !queueData?.length
    ) {
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

    return (
        <ul
            className={clsx(
                "flex flex-col rounded border border-slate-400 bg-slate-950",
                {
                    "gap-3 p-5": isMod(privileges),
                    "px-5 py-1": !isMod(privileges),
                },
            )}
        >
            {isMod(privileges) && <ModView />}
            {!isMod(privileges) && (
                <PlebView
                    privileges={privileges}
                    filteredQueueData={queueData.filter(
                        (entry) => entry.queue.visible,
                    )}
                />
            )}
        </ul>
    );
}

type QueueData = {
    queue: QueueEntry;
    userLikes: LikeEntry | null;
}[];

function PlebView({
    privileges,
    filteredQueueData,
}: {
    filteredQueueData: QueueData;
    privileges: number;
}) {
    return (
        <>
            {filteredQueueData.map(
                (
                    {
                        queue: {
                            artist,
                            id,
                            songName,
                            donorName,
                            current,
                            played,
                            likeCount,
                        },
                        userLikes,
                    },
                    index,
                ) => (
                    <li
                        key={id}
                        className="grid gap-2 border-b border-b-sky-600 px-1 py-3 last:border-transparent sm:grid-cols-2 sm:grid-rows-2"
                    >
                        <h2 className="col-span-2 grid items-center gap-2 sm:flex sm:flex-wrap">
                            <span
                                className={clsx(
                                    "rounded p-1 text-center leading-none",
                                    {
                                        "bg-sky-700": !current && !played,
                                        "bg-amber-400 text-black": current,
                                        "bg-slate-700": played && !current,
                                    },
                                )}
                            >
                                {index + 1}
                            </span>
                            <span className="font-bold text-sky-400">
                                {artist}
                            </span>{" "}
                            <span className="hidden sm:block">-</span>{" "}
                            {songName}
                        </h2>
                        {donorName && (
                            <p className="sm:justify-self-end">
                                from{" "}
                                <span className="font-bold text-amber-400">
                                    {donorName}
                                </span>
                            </p>
                        )}
                        <LikeBlock
                            songId={id}
                            className="col-start-2 justify-self-end"
                            count={likeCount}
                            loggedIn={privileges !== -1}
                            value={userLikes ? userLikes.value : 0}
                        />
                    </li>
                ),
            )}
        </>
    );
}
