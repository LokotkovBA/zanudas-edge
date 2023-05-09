"use client";
import Link from "next/link";
import { clientAPI } from "~/client/ClientProvider";
import DonationAlertsIcon from "~/svg/DonationAlertsIcon";
import { isMod } from "~/utils/privileges";
import { ModView } from "./ModView";
import { type QueueEntry } from "~/drizzle/types";
import clsx from "clsx";

export function QueueList({ privileges }: { privileges: number }) {
    const { data: queueData } = clientAPI.queue.getAll.useQuery();

    const filteredQueueData = queueData?.filter((entry) => entry.visible);

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
        <ul className="flex flex-col gap-3 rounded border border-slate-400 bg-slate-950 p-5">
            {isMod(privileges) && <ModView />}
            {!isMod(privileges) && (
                <PlebView
                    filteredQueueData={queueData.filter(
                        (entry) => entry.visible,
                    )}
                />
            )}
        </ul>
    );
}

function PlebView({ filteredQueueData }: { filteredQueueData: QueueEntry[] }) {
    return (
        <>
            {filteredQueueData
                .filter((entry) => entry.visible)
                .map(
                    (
                        { artist, id, songName, donorName, current, played },
                        index,
                    ) => (
                        <li
                            key={id}
                            className="grid grid-rows-2 border-b border-b-sky-600 p-1 sm:grid-cols-2"
                        >
                            <h2 className="col-span-2 flex flex-wrap items-center gap-2">
                                <span
                                    className={clsx(
                                        "rounded p-1 leading-none",
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
                                - {songName}
                            </h2>
                            {donorName && (
                                <p className="col-span-2 justify-self-end">
                                    from{" "}
                                    <span className="font-bold text-amber-400">
                                        {donorName}
                                    </span>
                                </p>
                            )}
                        </li>
                    ),
                )}
        </>
    );
}
