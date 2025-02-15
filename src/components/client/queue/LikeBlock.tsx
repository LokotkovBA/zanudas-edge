"use client";

import clsx from "clsx";
import { useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { ThumbsDown } from "~/svg/ThumbsDown";
import { ThumbsUp } from "~/svg/ThumbsUp";

export function LikeBlock({
    count,
    className = "",
    value,
    songId,
}: {
    songId: number;
    count: number;
    className?: string;
    value: number;
}) {
    const { mutate: like } = clientAPI.queue.like.useMutation({
        onSuccess(value) {
            socketClient.emit("like", {
                username: userData?.encUser,
                message: {
                    entryId: songId,
                    value,
                },
            });
        },
    });

    const { data: userData } = clientAPI.getAuth.useQuery();
    const [likeValue, setLikeValue] = useState(value);

    function changeLike(songId: number, value: number) {
        if (userData && userData.encUser) {
            like({ songId, value });
            setLikeValue(value);
        }
    }

    return (
        <section className={clsx("flex items-center gap-1", className)}>
            <h3 className="text-2xl">{count}</h3>
            <div>
                <ThumbsUp
                    onClick={() => changeLike(songId, likeValue === 1 ? 0 : 1)}
                    size="1.3rem"
                    className={clsx({
                        "cursor-pointer hover:fill-sky-500": !!userData,
                        "fill-slate-50": likeValue === 0 || likeValue === -1,
                        "fill-green-500": likeValue === 1,
                    })}
                />
                <ThumbsDown
                    onClick={() =>
                        changeLike(songId, likeValue === -1 ? 0 : -1)
                    }
                    size="1.3rem"
                    className={clsx({
                        "cursor-pointer hover:fill-sky-500": !!userData,
                        "fill-slate-50": likeValue === 0 || likeValue === 1,
                        "fill-red-500": likeValue === -1,
                    })}
                />
            </div>
        </section>
    );
}
