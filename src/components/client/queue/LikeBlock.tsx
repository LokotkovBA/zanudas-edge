"use client";

import clsx from "clsx";
import { ThumbsDown } from "~/svg/ThumbsDown";
import { ThumbsUp } from "~/svg/ThumbsUp";

export function LikeBlock({
    count,
    loggedIn,
    className = "",
}: {
    loggedIn: boolean;
    count: number;
    className?: string;
}) {
    return (
        <section className={clsx("flex items-center gap-1", className)}>
            <ThumbsUp
                size="1.5rem"
                className={clsx("fill-slate-500", {
                    "cursor-pointer hover:fill-sky-400": loggedIn,
                })}
            />
            {count}
            <ThumbsDown
                size="1.5rem"
                className={clsx("fill-slate-500", {
                    "cursor-pointer hover:fill-sky-400": loggedIn,
                })}
            />
        </section>
    );
}
