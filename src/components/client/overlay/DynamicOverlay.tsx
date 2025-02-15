"use client";
import { ChevronDown } from "~/svg/ChevronDown";
import { OverlayEntry } from "./OverlayEntry";
import { useSocketOverlay } from "./hooks/useSocketOverlay";

export function DynamicOverlay({ maxDisplay }: { maxDisplay: number }) {
    const [overlayEntries, oldCurrent, queueEntriesCount, text, textVisible] =
        useSocketOverlay(maxDisplay);

    return (
        <>
            <ul className="flex flex-col gap-2 p-2">
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
                {oldCurrent + Math.floor(maxDisplay / 2) < queueEntriesCount &&
                    queueEntriesCount > maxDisplay && <NotEndOfList />}
            </ul>
            {textVisible && <OverlayText text={text} />}
        </>
    );
}

function NotEndOfList() {
    return (
        <li className="flex justify-center">
            <ChevronDown size="2rem" className="animate-bounce fill-sky-400" />
        </li>
    );
}

function OverlayText({ text }: { text: string }) {
    return (
        <section className="mt-4 flex w-full justify-center text-center text-3xl">
            <h2 className="w-[22ch] whitespace-pre-line">{text}</h2>
        </section>
    );
}
