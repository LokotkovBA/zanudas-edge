"use client";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { PlayIcon } from "~/svg/PlayIcon";
import { ThumbsUp } from "~/svg/ThumbsUp";

export function DynamicOverlay({ maxDisplay }: { maxDisplay: number }) {
    const [oldCurrent, setOldCurrent] = useState<number>();

    const { data: overlayData } = clientAPI.queue.getOverlay.useQuery();
    const ctx = clientAPI.useContext();

    useEffect(() => {
        socketClient.on("current", (message: number) => {
            if (typeof message !== "number") {
                return;
            }

            setOldCurrent(message);
        });

        socketClient.emit("sub admin");

        return () => {
            socketClient.off("current");
            socketClient.emit("unsub admin");
        };
    }, []);

    useEffect(() => {
        socketClient.on("invalidate", () => {
            ctx.queue.getOverlay.invalidate();
        });

        return () => {
            socketClient.off("invalidate");
        };
    }, [ctx.queue.getOverlay]);

    return (
        <>
            {filterMaxDisplay(maxDisplay, overlayData, oldCurrent)?.map(
                ({
                    id,
                    artist,
                    songName,
                    current,
                    played,
                    queueNumber,
                    likeCount,
                }) => (
                    <OverlayEntry
                        key={id}
                        artist={artist}
                        songName={songName}
                        isCurrent={current === 1}
                        isPlayed={played === 1}
                        index={queueNumber + 1}
                        likeCount={likeCount}
                    />
                ),
            )}
        </>
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
        <li
            className={clsx(
                "grid grid-cols-10 items-start justify-start gap-4",
                {
                    "text-4xl": isCurrent,
                },
            )}
        >
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

type OverlayEntry = {
    id: number;
    artist: string;
    songName: string;
    likeCount: number;
    current: number;
    played: number;
    queueNumber: number;
};

function filterMaxDisplay(
    maxDisplay: number,
    queueEntries?: OverlayEntry[],
    oldCurrent?: number,
) {
    if (!queueEntries) {
        return;
    }
    let current = 0;
    if (oldCurrent !== undefined) {
        current = oldCurrent - 1;
    } else {
        for (const entry of queueEntries) {
            if (entry.current === 1) {
                break;
            }
            current++;
        }
    }

    let min = current - Math.floor(maxDisplay / 2);
    min =
        queueEntries.length - min - 1 >= maxDisplay
            ? min
            : queueEntries.length - maxDisplay;

    let displayed = 0;
    const out: typeof queueEntries = [];

    let index = 0;
    for (const entry of queueEntries) {
        if (min <= index) {
            displayed++;
            entry.queueNumber = index;
            out.push(entry);
        }

        index++;
        if (displayed === maxDisplay) {
            break;
        }
    }
    return out;
}
