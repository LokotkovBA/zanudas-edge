"use client";

import clsx from "clsx";
import { CheckMark } from "~/svg/CheckMark";
import { PlayIcon } from "~/svg/PlayIcon";
import { ThumbsUp } from "~/svg/ThumbsUp";

type OverlayEntryProps = {
    artist: string;
    songName: string;
    index: number;
    isCurrent: boolean;
    isPlayed: boolean;
    likeCount: number;
};

export function OverlayEntry({
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
                "mt-1 grid grid-cols-10 items-start justify-start gap-4",
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
            <span
                className={clsx("col-span-7 self-center", {
                    "leading-none": isCurrent,
                })}
            >
                {artist} - {songName}
            </span>
            <span
                className={clsx("col-span-2 flex gap-2 justify-self-end", {
                    "self-center": isCurrent,
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
