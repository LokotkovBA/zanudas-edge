import { type Song } from "~/drizzle/types";
import { SongListEntry } from "./SongListEntry";

type ArtistBlockProps = {
    artist: string;
    block: Song[];
    modalEditRef: React.RefObject<HTMLDialogElement>;
    modalDeleteRef: React.RefObject<HTMLDialogElement>;
    setModalData: (entry: Song) => void;
};

export function ArtistBlock({
    artist,
    block,
    modalEditRef,
    modalDeleteRef,
    setModalData,
}: ArtistBlockProps) {
    return (
        <li
            className="z-0 mb-2 rounded border border-slate-500 bg-slate-950 p-3 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow hover:shadow-black"
            id={artist}
        >
            <h2 className="border-b border-b-sky-400 text-lg font-bold text-sky-400">
                {artist ?? "Empty list"}
            </h2>
            <div className="flex flex-col gap-2 py-2">
                {block.map((song, index) => (
                    <SongListEntry
                        key={song.id}
                        song={song}
                        index={index}
                        setModalData={setModalData}
                        modalDeleteRef={modalDeleteRef}
                        modalEditRef={modalEditRef}
                    />
                ))}
            </div>
        </li>
    );
}
