import clsx from "clsx";
import { serverAPI } from "~/server/api";
import { PlayIcon } from "~/svg/PlayIcon";

export const runtime = "edge";

export default async function Overlay() {
    const data = await serverAPI.queue.getFiltered.fetch();
    return (
        <main>
            <table className="w-full text-[1.7rem] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                <thead>
                    <tr className="text-sky-400">
                        <th scope="col">#</th>
                        <th className="text-left" scope="col">
                            Artist
                        </th>
                        <th className="text-left" scope="col">
                            Title
                        </th>
                        <th scope="col">Likes</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(
                        (
                            {
                                queue: {
                                    likeCount,
                                    played,
                                    current,
                                    songName,
                                    artist,
                                    id,
                                },
                            },
                            index,
                        ) => (
                            <OverlayEntry
                                key={id}
                                index={index + 1}
                                artist={artist}
                                songName={songName}
                                isCurrent={!!current}
                                isPlayed={!!played}
                                likeCount={likeCount}
                            />
                        ),
                    )}
                </tbody>
            </table>
        </main>
    );
}

type OverlayEntryProps = {
    artist: string;
    songName: string;
    index: number;
    isCurrent: boolean;
    isPlayed: boolean;
    likeCount: number;
};

function OverlayEntry({
    artist,
    index,
    songName,
    isCurrent,
    isPlayed,
    likeCount,
}: OverlayEntryProps) {
    return (
        <tr
            className={clsx("", {
                "border-b border-t border-sky-400": isCurrent,
            })}
        >
            <td
                className={clsx("flex justify-center font-semibold", {
                    "font-semibold text-slate-400": isPlayed,
                })}
            >
                {isCurrent ? (
                    <PlayIcon
                        className="fill-sky-300 stroke-sky-300"
                        size="1.5em"
                    />
                ) : (
                    index
                )}
            </td>
            <td>{artist}</td>
            <td>{songName}</td>
            <td className="text-center">{likeCount}</td>
        </tr>
    );
}
