"use client";

import { type ChangeEvent, useLayoutEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";
import { inputStyles } from "~/components/styles/input";
import { type QueueEntry } from "~/drizzle/types";
import { LikeBlock } from "./LikeBlock";
import { CheckBox } from "~/components/utils/CheckBox";

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

    const { mutate: setCurrent } = clientAPI.queue.setCurrent.useMutation({
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
            {queueData?.map(({ queue: entry, userLikes }) => {
                function changeHandler(event: ChangeEvent<HTMLInputElement>) {
                    changeEntry({
                        ...entry,
                        [event.target.name]: event.target.checked ? 1 : 0,
                    });
                }

                return (
                    <li
                        className="grid cursor-grab grid-cols-1 gap-2 rounded border border-sky-400 bg-sky-950 p-2 sm:grid-cols-queue"
                        key={entry.id}
                    >
                        <h2 className="flex gap-2 sm:row-start-1">
                            <span className="font-bold text-sky-400">
                                {entry.queueNumber}
                            </span>
                            {entry.artist} - {entry.songName}
                        </h2>
                        <button
                            onClick={() => {
                                setCurrentEntry(entry);
                                modalDeleteRef.current?.showModal();
                            }}
                            className="row-start-1 justify-self-end rounded-full border border-transparent bg-sky-800 p-2 hover:border-sky-400 sm:col-start-2"
                        >
                            ❌
                        </button>
                        <LikeBlock
                            songId={entry.id}
                            count={entry.likeCount}
                            value={userLikes ? userLikes.value : 0}
                            className="justify-self-center"
                        />
                        <form className="grid grid-cols-2 items-center gap-x-1 gap-y-2">
                            <div className="justify-self-end">
                                <input
                                    className="hidden"
                                    onChange={changeHandler}
                                    id={`${entry.id}-visible`}
                                    name="visible"
                                    checked={entry.visible === 1}
                                    type="checkbox"
                                />
                                <label
                                    className="cursor-pointer"
                                    htmlFor={`${entry.id}-visible`}
                                >
                                    Visible
                                </label>
                            </div>
                            <CheckBox
                                id={`visible-${entry.id}`}
                                className="justify-self-start"
                                checked={entry.visible === 1}
                                onClick={(oldChecked) => {
                                    changeEntry({
                                        ...entry,
                                        visible: oldChecked ? 0 : 1,
                                    });
                                }}
                            />

                            <div className="justify-self-end">
                                <input
                                    className="hidden"
                                    onChange={changeHandler}
                                    id={`${entry.id}-played`}
                                    name="played"
                                    checked={entry.played === 1}
                                    type="checkbox"
                                />
                                <label
                                    className="cursor-pointer"
                                    htmlFor={`${entry.id}-played`}
                                >
                                    Played
                                </label>
                            </div>
                            <CheckBox
                                id={`played-${entry.id}`}
                                className="justify-self-start"
                                checked={entry.played === 1}
                                onClick={(oldChecked) => {
                                    changeEntry({
                                        ...entry,
                                        played: oldChecked ? 0 : 1,
                                    });
                                }}
                            />

                            <div className="justify-self-end">
                                <input
                                    className="hidden"
                                    onChange={(event) => {
                                        setCurrent({
                                            id: entry.id,
                                            value: event.target.checked,
                                        });
                                    }}
                                    id={`${entry.id}-current`}
                                    name="current"
                                    checked={entry.current === 1}
                                    type="checkbox"
                                />
                                <label
                                    className="cursor-pointer"
                                    htmlFor={`${entry.id}-current`}
                                >
                                    Current
                                </label>
                            </div>
                            <CheckBox
                                id={`current-${entry.id}`}
                                className="justify-self-start"
                                checked={entry.current === 1}
                                onClick={(oldChecked) => {
                                    setCurrent({
                                        id: entry.id,
                                        value: !oldChecked,
                                    });
                                }}
                            />

                            <div className="justify-self-end">
                                <input
                                    className="hidden"
                                    onChange={changeHandler}
                                    id={`${entry.id}-willAdd`}
                                    name="willAdd"
                                    checked={entry.willAdd === 1}
                                    type="checkbox"
                                />
                                <label
                                    className="cursor-pointer"
                                    htmlFor={`${entry.id}-willAdd`}
                                >
                                    Will add
                                </label>
                            </div>
                            <CheckBox
                                id={`willAdd-${entry.id}`}
                                className="justify-self-start"
                                checked={entry.willAdd === 1}
                                onClick={(oldChecked) => {
                                    changeEntry({
                                        ...entry,
                                        willAdd: oldChecked ? 0 : 1,
                                    });
                                }}
                            />
                        </form>
                        <button
                            onClick={() => {
                                setCurrentEntry(entry);
                                modalEditRef.current?.showModal();
                            }}
                            className="rounded border border-transparent bg-sky-800 p-2 hover:border-sky-400 sm:col-span-2"
                        >
                            Open edit
                        </button>
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
            <form className="grid grid-cols-mobileEdit items-center gap-2 sm:grid-cols-desktopEdit">
                <label htmlFor="artist">Artist</label>
                <input
                    ref={artistRef}
                    id="artist"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="songName">Song name</label>
                <input
                    ref={songNameRef}
                    id="songName"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="tag">Tag</label>
                <input
                    ref={tagRef}
                    id="tag"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="donorName">Donor name</label>
                <input
                    ref={donorNameRef}
                    id="donorName"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="donateAmount">Donate amount</label>
                <input
                    ref={donateAmountRef}
                    id="donateAmount"
                    className={inputStyles}
                    type="number"
                />
                <label htmlFor="currency">Currency</label>
                <input
                    ref={currencyRef}
                    id="currency"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="donorText">Donor message</label>
                <textarea
                    ref={donorTextRef}
                    id="donorText"
                    className={inputStyles}
                />
                <button type="submit" className={`${buttonStyles} col-span-2`}>
                    Change
                </button>
            </form>
        </dialog>
    );
}
