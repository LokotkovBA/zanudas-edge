"use client";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { CheckMark } from "~/svg/CheckMark";
import { ChevronDown } from "~/svg/ChevronDown";
import { PlayIcon } from "~/svg/PlayIcon";
import { ThumbsUp } from "~/svg/ThumbsUp";

export function DynamicOverlay({ maxDisplay }: { maxDisplay: number }) {
    const [oldCurrent, setOldCurrent] = useState(0);
    const [text, setText] = useState("");
    const [textVisible, setTextVisible] = useState(false);

    const ctx = clientAPI.useContext();
    const { data: overlayData } = clientAPI.queue.getOverlay.useQuery(
        undefined,
        {
            onSuccess(queueEntries) {
                setOverlayEntries(
                    filterMaxDisplay(maxDisplay, queueEntries, oldCurrent),
                );
            },
        },
    );
    const [overlayEntries, setOverlayEntries] = useState<OverlayEntry[]>(
        filterMaxDisplay(maxDisplay, overlayData, oldCurrent),
    );

    useEffect(() => {
        socketClient.on("invalidate", () => {
            ctx.queue.getOverlay.invalidate();
        });

        return () => {
            socketClient.off("invalidate");
        };
    }, [ctx.queue.getOverlay]);

    useEffect(() => {
        socketClient.on("overlay text", (message: string) => {
            if (typeof message !== "string") {
                return;
            }

            setText(message);
        });

        socketClient.on("overlay text visibility", (message: string) => {
            if (typeof message !== "string") {
                return;
            }

            setTextVisible(message === "show");
        });

        socketClient.emit("sub admin");
        socketClient.emit("get overlay text");
        socketClient.emit("get overlay text visibility");
        socketClient.emit("get current");

        return () => {
            socketClient.emit("unsub admin");
            socketClient.off("overlay text");
            socketClient.off("overlay text visibility");
        };
    }, []);

    useEffect(() => {
        socketClient.on("current", (message: number) => {
            if (typeof message !== "number") {
                return;
            }

            setOldCurrent(message);
            setOverlayEntries(
                filterMaxDisplay(maxDisplay, overlayData, message),
            );
        });
        return () => {
            socketClient.off("current");
        };
    }, [maxDisplay, overlayData]);

    return (
        <>
            <ul className="flex flex-col gap-4 p-2">
                {overlayEntries.map(
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
                {oldCurrent + Math.floor(maxDisplay / 2) <
                    (overlayData?.length ?? 0) &&
                    (overlayData?.length ?? 0) > maxDisplay && <NotEndOfList />}
            </ul>
            {textVisible && <OverlayText text={text} />}
        </>
    );
}

function NotEndOfList() {
    return (
        <li className="flex justify-center">
            <ChevronDown size="2rem" className="fill-sky-400" />
        </li>
    );
}

function OverlayText({ text }: { text: string }) {
    return (
        <section className="mt-4 flex w-full justify-center text-center text-4xl">
            <h2 className="w-[22ch] whitespace-pre-line">{text}</h2>
        </section>
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
                className={clsx("justify-self-center", {
                    "self-center": isCurrent,
                })}
            >
                {isCurrent ? (
                    <PlayIcon className="fill-sky-400" size="2em" />
                ) : isPlayed ? (
                    <CheckMark
                        id={index.toString()}
                        size="2rem"
                        className="fill-sky-400"
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
                    "self-center leading-none": isCurrent,
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
        return [];
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
