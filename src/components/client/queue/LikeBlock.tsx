"use client";

import clsx from "clsx";
import { ThumbsDown } from "~/svg/ThumbsDown";
import { ThumbsUp } from "~/svg/ThumbsUp";

export function LikeBlock({
    count,
    loggedIn,
    className = "",
    value,
}: {
    loggedIn: boolean;
    count: number;
    className?: string;
    value: number;
}) {
    return (
        <section className={clsx("flex items-center gap-1", className)}>
            <ThumbsUp
                size="1.5rem"
                className={clsx({
                    "cursor-pointer hover:fill-sky-400": loggedIn,
                    "fill-slate-50": value === 0 || value === -1,
                    "fill-green-400": value === 1,
                })}
            />
            {count}
            <ThumbsDown
                size="1.5rem"
                className={clsx({
                    "cursor-pointer hover:fill-sky-400": loggedIn,
                    "fill-slate-50": value === 0 || value === 1,
                    "fill-red-400": value === -1,
                })}
            />
        </section>
    );
}
