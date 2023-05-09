import { type ChangeEvent, useLayoutEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";
import { deleteButtonStyles } from "~/components/styles/deleteButton";
import { searchBarStyles } from "~/components/styles/searchBar";
import { type QueueEntry } from "~/drizzle/types";

export function ModView() {
    const { data: queueData } = clientAPI.queue.getAll.useQuery();
    const { mutate: changeEntry } = clientAPI.queue.change.useMutation({
        onMutate() {
            toast.loading("Changing");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Changed");
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    const [currentEntry, setCurrentEntry] = useState<QueueEntry | null>(null);
    const modalEditRef = useRef<HTMLDialogElement>(null);
    const modalDeleteRef = useRef<HTMLDialogElement>(null);

    return (
        <>
            {queueData?.map((entry) => {
                function changeHandler(event: ChangeEvent<HTMLInputElement>) {
                    changeEntry({
                        ...entry,
                        [event.target.name]: event.target.checked ? 1 : 0,
                    });
                }

                return (
                    <li
                        className="grid grid-cols-2 gap-2 border-b border-sky-400 p-2"
                        key={entry.id}
                    >
                        <h2 className="col-start-1 col-end-3 flex gap-2">
                            <span className="font-bold text-sky-400">
                                {entry.queueNumber}
                            </span>
                            {entry.artist} - {entry.songName}
                        </h2>
                        <button
                            onClick={() => {
                                setCurrentEntry(entry);
                                modalEditRef.current?.showModal();
                            }}
                            className={buttonStyles}
                        >
                            Open edit
                        </button>
                        <button
                            onClick={() => {
                                setCurrentEntry(entry);
                                modalDeleteRef.current?.showModal();
                            }}
                            className={deleteButtonStyles}
                        >
                            ❌
                        </button>
                        <form className="grid grid-cols-2">
                            <input
                                onChange={changeHandler}
                                id={`${entry.id}-visible`}
                                name="visible"
                                defaultChecked={entry.visible === 1}
                                type="checkbox"
                            />
                            <label htmlFor={`${entry.id}-visible`}>
                                Visible
                            </label>
                            <input
                                onChange={changeHandler}
                                id={`${entry.id}-played`}
                                name="played"
                                defaultChecked={entry.played === 1}
                                type="checkbox"
                            />
                            <label htmlFor={`${entry.id}-played`}>Played</label>
                            <input
                                onChange={changeHandler}
                                id={`${entry.id}-current`}
                                name="played"
                                defaultChecked={entry.played === 1}
                                type="checkbox"
                            />
                            <label htmlFor={`${entry.id}-current`}>
                                Current
                            </label>
                            <input
                                onChange={changeHandler}
                                id={`${entry.id}-willAdd`}
                                name="willAdd"
                                defaultChecked={entry.willAdd === 1}
                                type="checkbox"
                            />
                            <label htmlFor={`${entry.id}-willAdd`}>
                                Will add
                            </label>
                        </form>
                    </li>
                );
            })}
            <ModalEdit
                modalRef={modalEditRef}
                entry={currentEntry}
                changeEntry={changeEntry}
            />
            <ModalDelete
                modalRef={modalDeleteRef}
                id={currentEntry?.id}
                songName={currentEntry?.songName}
                donorName={currentEntry?.donorName}
            />
        </>
    );
}
function ModalDelete({
    artist,
    songName,
    donorName,
    id,
    modalRef,
}: {
    id?: number;
    artist?: string;
    songName?: string;
    donorName?: string;
    modalRef: React.RefObject<HTMLDialogElement>;
}) {
    const { mutate: deleteEntry } = clientAPI.queue.delete.useMutation({
        onMutate() {
            toast.loading("Deleting");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Deleted");
            modalRef.current?.close();
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });
    return (
        <dialog
            ref={modalRef}
            className="border border-slate-500 bg-slate-900 text-slate-50"
        >
            <section className="grid grid-cols-2 gap-1 ">
                <h2 className="col-start-1 col-end-3">
                    Are you sure you want to delete {artist} - {songName} from{" "}
                    {donorName || "Admin"}?
                </h2>
                {id !== undefined && (
                    <button
                        className={buttonStyles}
                        onClick={() => deleteEntry({ id })}
                    >
                        Yes!
                    </button>
                )}
                <button
                    className="rounded border-2 border-transparent bg-slate-600 p-1 hover:border-slate-300"
                    onClick={() => modalRef.current?.close()}
                >
                    No!✋
                </button>
            </section>
        </dialog>
    );
}

function ModalEdit({
    entry,
    modalRef,
    changeEntry,
}: {
    entry: QueueEntry | null;
    modalRef: React.RefObject<HTMLDialogElement>;
    changeEntry: (entry: QueueEntry) => void;
}) {
    const [artistValue, setArtistValue] = useState("");
    const [songNameValue, setSongNameValue] = useState("");
    const [tagValue, setTagValue] = useState("");
    useLayoutEffect(() => {
        setArtistValue(entry?.artist ?? "");
        setSongNameValue(entry?.songName ?? "");
        setTagValue(entry?.tag ?? "");
    }, [entry?.songName, entry?.tag, entry?.artist]);

    return (
        <dialog
            className="border border-slate-500 bg-slate-900 text-slate-50"
            onSubmit={(event) => {
                event.preventDefault();
                if (!entry) {
                    return;
                }
                changeEntry({
                    ...entry,
                    id: entry.id ?? -1,
                    artist: artistValue,
                    songName: songNameValue,
                    tag: tagValue,
                });
            }}
            ref={modalRef}
        >
            <button
                onClick={() => modalRef.current?.close()}
                className={`${buttonStyles} mb-1`}
            >
                Close
            </button>
            <form className="grid grid-cols-songEdit items-center gap-2">
                <label htmlFor="artist">Artist</label>
                <input
                    onChange={(event) => setArtistValue(event.target.value)}
                    value={artistValue}
                    id="artist"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="songName">Song name</label>
                <input
                    onChange={(event) => setSongNameValue(event.target.value)}
                    value={songNameValue}
                    id="songName"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="tag">Tag</label>
                <input
                    onChange={(event) => setTagValue(event.target.value)}
                    value={tagValue}
                    id="tag"
                    className={searchBarStyles}
                    type="text"
                />
                <button type="submit" className={`${buttonStyles} col-span-2`}>
                    Change
                </button>
            </form>
        </dialog>
    );
}
