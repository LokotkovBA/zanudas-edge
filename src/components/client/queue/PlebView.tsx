"use client";

import { clientAPI } from "~/client/ClientProvider";
import { PlebEntry } from "./PlebEntry";

export function PlebView() {
    const { data: filteredQueueData } = clientAPI.queue.getFiltered.useQuery();

    return (
        <>
            {filteredQueueData?.map(({ queue, userLikes }, index) => {
                return (
                    <PlebEntry
                        id={queue.id}
                        index={index}
                        key={queue.id}
                        artist={queue.artist}
                        songName={queue.songName}
                        donorName={queue.donorName}
                        current={queue.current}
                        played={queue.played}
                        likeCount={queue.likeCount}
                        userLikes={userLikes}
                    />
                );
            })}
        </>
    );
}
