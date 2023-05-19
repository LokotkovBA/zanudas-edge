import { serverAPI } from "~/server/api";

export const runtime = "edge";
export const preferredRegion = "arn1";

export default async function Overlay() {
    const data = await serverAPI.queue.getFiltered.fetch();
    return (
        <main className="bg-sky-400">
            {data.map((entry) => (
                <div key={entry.queue.id}>{entry.queue.songName}</div>
            ))}
        </main>
    );
}
