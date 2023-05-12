"use client";

import clsx from "clsx";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { ThumbsDown } from "~/svg/ThumbsDown";
import { ThumbsUp } from "~/svg/ThumbsUp";

export function LikeBlock({
    count,
    className = "",
    value: oldValue,
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

    return (
        <section className={clsx("flex items-center gap-1", className)}>
            <h3 className="text-2xl">{count}</h3>
            <div>
                <ThumbsUp
                    onClick={() => {
                        if (userData && userData.encUser) {
                            like({ songId, value: oldValue === 1 ? 0 : 1 });
                        }
                    }}
                    size="1.2rem"
                    className={clsx({
                        "cursor-pointer hover:fill-sky-500":
                            userData !== undefined,
                        "fill-slate-50": oldValue === 0 || oldValue === -1,
                        "fill-green-500": oldValue === 1,
                    })}
                />
                <ThumbsDown
                    onClick={() => {
                        if (userData && userData.encUser) {
                            like({ songId, value: oldValue === -1 ? 0 : -1 });
                        }
                    }}
                    size="1.2rem"
                    className={clsx({
                        "cursor-pointer hover:fill-sky-500":
                            userData !== undefined,
                        "fill-slate-50": oldValue === 0 || oldValue === 1,
                        "fill-red-500": oldValue === -1,
                    })}
                />
            </div>
        </section>
    );
}
