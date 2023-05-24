import clsx from "clsx";
import { redirect } from "next/navigation";
import { OverlaySocketsSub } from "~/components/client/overlay/OverlaySocketsSub";
import { serverAPI } from "~/server/api";
import { PlayIcon } from "~/svg/PlayIcon";
import { ThumbsUp } from "~/svg/ThumbsUp";

export const runtime = "edge";
export const preferredRegion = "arn1";

export default async function Overlay({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const maxDisplay = parseMaxDisplay(searchParams.maxDisplay);
    const oldCurrent = parseOldCurrent(searchParams.oldCurrent);
    const data = await serverAPI.queue.getOverlay.fetch({
        maxDisplay,
        oldCurrent,
    });

    return (
        <main className="text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            <ul className="flex flex-col gap-4 p-2">
                {data.map(
                    ({
                        id,
                        artist,
                        queueNumber,
                        songName,
                        likeCount,
                        played,
                        current,
                    }) => {
                        if (
                            (oldCurrent === undefined ||
                                oldCurrent !== queueNumber) &&
                            current === 1
                        ) {
                            redirect(
                                `/overlay?maxDisplay=${maxDisplay}&oldCurrent=${queueNumber}`,
                            );
                        }
                        return (
                            <OverlayEntry
                                key={id}
                                index={queueNumber + 1}
                                artist={artist}
                                songName={songName}
                                isCurrent={current === 1}
                                isPlayed={played === 1}
                                likeCount={likeCount}
                            />
                        );
                    },
                )}
            </ul>
            <OverlaySocketsSub />
        </main>
    );
}
type OverlayEntryProps = {
    artist: string;
    songName: string;
    index: number;
    isCurrent: boolean;
    isPlayed: boolean;
    likeCount: number;
};

function OverlayEntry({
    index,
    artist,
    songName,
    likeCount,
    isPlayed,
    isCurrent,
}: OverlayEntryProps) {
    return (
        <li className="grid grid-cols-10 items-start justify-start gap-4">
            <span
                className={clsx("justify-self-end", {
                    "text-slate-400": isPlayed,
                })}
            >
                {isCurrent ? (
                    <PlayIcon
                        className="translate-x-5 fill-sky-400"
                        size="2em"
                    />
                ) : (
                    index
                )}
            </span>
            <span className="col-span-7 self-center">
                {artist} - {songName}
            </span>
            <span
                className={clsx("col-span-2 flex gap-2 justify-self-end", {
                    "self-": isCurrent,
                })}
            >
                {likeCount >= 0 && (
                    <>
                        {likeCount}
                        <ThumbsUp className="fill-green-500" size="1em" />
                    </>
                )}
            </span>
        </li>
    );
}

function parseMaxDisplay(input: string | string[] | undefined): number {
    if (typeof input !== "string") {
        return 5;
    }
    const output = parseInt(input);
    return isNaN(output) ? 5 : output;
}

function parseOldCurrent(
    input: string | string[] | undefined,
): number | undefined {
    if (typeof input !== "string") {
        return;
    }
    const output = parseInt(input);
    return isNaN(output) ? undefined : output;
}
