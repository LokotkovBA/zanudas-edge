"use client";

import clsx from "clsx";
import { clientAPI } from "~/client/ClientProvider";
import { ThumbsDown } from "~/svg/ThumbsDown";
import { ThumbsUp } from "~/svg/ThumbsUp";

export function LikeBlock({
    count,
    loggedIn,
    className = "",
    value,
    songId,
}: {
    songId: number;
    loggedIn: boolean;
    count: number;
    className?: string;
    value: number;
}) {
    const { mutate: like } = clientAPI.queue.like.useMutation();

    return (
        <section className={clsx("flex items-center gap-1", className)}>
            <ThumbsUp
                onClick={() => {
                    if (loggedIn) {
                        like({ songId, value: value === 1 ? 0 : 1 });
                    }
                }}
                size="1.5rem"
                className={clsx({
                    "cursor-pointer hover:fill-sky-500": loggedIn,
                    "fill-slate-50": value === 0 || value === -1,
                    "fill-green-500": value === 1,
                })}
            />
            {count}
            <ThumbsDown
                onClick={() => {
                    if (loggedIn) {
                        like({ songId, value: value === -1 ? 0 : -1 });
                    }
                }}
                size="1.5rem"
                className={clsx({
                    "cursor-pointer hover:fill-sky-500": loggedIn,
                    "fill-slate-50": value === 0 || value === 1,
                    "fill-red-500": value === -1,
                })}
            />
        </section>
    );
}
