import { useEffect } from "react";
import { EntryNumber } from "~/components/server/queue/EntryNumber";
import { LikeBlock } from "./LikeBlock";

type PlebEntryProps = {
    id: number;
    index: number;
    artist: string;
    songName: string;
    donorName: string;
    current: number;
    played: number;
    likeCount: number;
    userLikes: {
        value: number;
    } | null;
};

export function PlebEntry({
    artist,
    id,
    index,
    songName,
    donorName,
    current,
    played,
    likeCount,
    userLikes,
}: PlebEntryProps) {
    useEffect(() => {
        if (current) {
            document.title = `${artist} - ${songName}`;
        }
    }, [current, artist, songName]);

    return (
        <li className="grid items-center gap-2 border-b border-b-sky-600 px-1 py-3 last:border-transparent sm:grid-cols-2 sm:grid-rows-2">
            <h2 className="col-span-2 grid items-center gap-2 sm:flex sm:flex-wrap">
                <EntryNumber
                    number={index + 1}
                    current={!!current}
                    played={!!played}
                />
                <span className="font-bold text-sky-400">{artist}</span>{" "}
                <span className="hidden sm:block">-</span> {songName}
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
    );
}
