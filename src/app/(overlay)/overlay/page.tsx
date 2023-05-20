import clsx from "clsx";
import { serverAPI } from "~/server/api";
import { PlayIcon } from "~/svg/PlayIcon";

export const runtime = "edge";
export const preferredRegion = "arn1";

export default async function Overlay() {
    const data = await serverAPI.queue.getFiltered.fetch();
    return (
        <main>
            <table className="w-full text-[2rem] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
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
                            <tr
                                className={clsx({
                                    "border-b-[.05em] border-t-[.05em] border-sky-400":
                                        current,
                                })}
                                key={id}
                            >
                                <td
                                    className={clsx(
                                        "flex justify-center font-semibold",
                                        {
                                            "font-semibold text-slate-400":
                                                played,
                                        },
                                    )}
                                >
                                    {current === 0 ? (
                                        index + 1
                                    ) : (
                                        <PlayIcon
                                            className="fill-sky-300 stroke-sky-300"
                                            size="1.5em"
                                        />
                                    )}
                                </td>
                                <td>{artist}</td>
                                <td>{songName}</td>
                                <td className="text-center">{likeCount}</td>
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
        </main>
    );
}
