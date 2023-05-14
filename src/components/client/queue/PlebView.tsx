"use client";

import { clientAPI } from "~/client/ClientProvider";
import { LikeBlock } from "./LikeBlock";
import { EntryNumber } from "./EntryNumber";

export function PlebView() {
    const { data: filteredQueueData } = clientAPI.queue.getFiltered.useQuery();

    return (
        <>
            {filteredQueueData?.map(
                (
                    {
                        queue: {
                            artist,
                            id,
                            songName,
                            donorName,
                            current,
                            played,
                            likeCount,
                        },
                        userLikes,
                    },
                    index,
                ) => (
                    <li
                        key={id}
                        className="grid items-center gap-2 border-b border-b-sky-600 px-1 py-3 last:border-transparent sm:grid-cols-2 sm:grid-rows-2"
                    >
                        <h2 className="col-span-2 grid items-center gap-2 sm:flex sm:flex-wrap">
                            <EntryNumber
                                number={index + 1}
                                current={!!current}
                                visible={true}
                                played={!!played}
                            />
                            <span className="font-bold text-sky-400">
                                {artist}
                            </span>{" "}
                            <span className="hidden sm:block">-</span>{" "}
                            {songName}
                        </h2>
                        {donorName && (
                            <p className="justify-self-end">
                                from{" "}
                                <span className="font-bold text-amber-400">
                                    {donorName}
                                </span>
                            </p>
                        )}
                        <LikeBlock
                            songId={id}
                            className="col-start-2 justify-self-end"
                            count={likeCount}
                            value={userLikes ? userLikes.value : 0}
                        />
                    </li>
                ),
            )}
        </>
    );
}
