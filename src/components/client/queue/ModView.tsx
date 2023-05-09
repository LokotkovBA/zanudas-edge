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
            modalDeleteRef.current?.close();
            modalEditRef.current?.close();
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
    const artistRef = useRef<HTMLInputElement>(null);
    const songNameRef = useRef<HTMLInputElement>(null);
    const tagRef = useRef<HTMLInputElement>(null);
    const donorNameRef = useRef<HTMLInputElement>(null);
    const donateAmountRef = useRef<HTMLInputElement>(null);
    const donorTextRef = useRef<HTMLTextAreaElement>(null);
    const currencyRef = useRef<HTMLInputElement>(null);

    //oh well
    useLayoutEffect(() => {
        if (artistRef.current) {
            artistRef.current.value = entry?.artist ?? "";
        }
    }, [entry?.artist]);
    useLayoutEffect(() => {
        if (songNameRef.current) {
            songNameRef.current.value = entry?.songName ?? "";
        }
    }, [entry?.songName]);
    useLayoutEffect(() => {
        if (tagRef.current) {
            tagRef.current.value = entry?.tag ?? "";
        }
    }, [entry?.tag]);
    useLayoutEffect(() => {
        if (donorNameRef.current) {
            donorNameRef.current.value = entry?.donorName ?? "";
        }
    }, [entry?.donorName]);
    useLayoutEffect(() => {
        if (donateAmountRef.current) {
            donateAmountRef.current.value =
                entry?.donateAmount.toString() ?? "";
        }
    }, [entry?.donateAmount]);
    useLayoutEffect(() => {
        if (donorTextRef.current) {
            donorTextRef.current.value = entry?.donorText ?? "";
        }
    }, [entry?.donorText]);
    useLayoutEffect(() => {
        if (currencyRef.current) {
            currencyRef.current.value = entry?.currency ?? "";
        }
    }, [entry?.currency]);

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
                    artist: artistRef.current?.value ?? "",
                    songName: songNameRef.current?.value ?? "",
                    tag: tagRef.current?.value ?? "",
                    donorName: donorNameRef.current?.value ?? "",
                    donateAmount: parseInt(
                        donateAmountRef.current?.value ?? "0",
                    ),
                    donorText: donorTextRef.current?.value ?? "",
                    currency: currencyRef.current?.value ?? "",
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
                    ref={artistRef}
                    id="artist"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="songName">Song name</label>
                <input
                    ref={songNameRef}
                    id="songName"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="tag">Tag</label>
                <input
                    ref={tagRef}
                    id="tag"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="donorName">Donor name</label>
                <input
                    ref={donorNameRef}
                    id="donorName"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="donateAmount">Donate amount</label>
                <input
                    ref={donateAmountRef}
                    id="donateAmount"
                    className={searchBarStyles}
                    type="number"
                />
                <label htmlFor="currency">Currency</label>
                <input
                    ref={currencyRef}
                    id="currency"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="donorText">donorText</label>
                <textarea
                    ref={donorTextRef}
                    id="donorText"
                    className={searchBarStyles}
                />
                <button type="submit" className={`${buttonStyles} col-span-2`}>
                    Change
                </button>
            </form>
        </dialog>
    );
}
