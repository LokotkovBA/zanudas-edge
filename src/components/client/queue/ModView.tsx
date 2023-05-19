"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";
import { inputStyles } from "~/components/styles/input";
import type { ChangedQueueEntry, QueueEntry } from "~/drizzle/types";
import { socketClient } from "~/client/socketClient";
import { ModQueueEntry } from "./ModQueueEntry";
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableModQueueEntry } from "./SortableModQueueEntry";

export function ModView() {
    const { data: queueData } = clientAPI.queue.getAll.useQuery();
    const { data: userData } = clientAPI.getAuth.useQuery();
    const { mutate: changeEntry } = clientAPI.queue.change.useMutation({
        onMutate() {
            toast.loading("Changing");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Changed");
            modalDeleteRef.current?.close();
            modalChangeRef.current?.close();
            socketClient.emit("invalidate", { username: userData?.encUser });
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
            socketClient.emit("invalidate", { username: userData?.encUser });
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
    const modalChangeRef = useRef<HTMLDialogElement>(null);
    const modalDeleteRef = useRef<HTMLDialogElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const [activeId, setActiveId] = useState<string | null>(null);
    const [order, setOrder] = useState(queueData?.order);

    useLayoutEffect(() => {
        if (queueData?.order) {
            setOrder(queueData.order);
        }
    }, [queueData?.order]);

    const { mutate: changeOrder } = clientAPI.queue.changeOrder.useMutation({
        onMutate() {
            toast.loading("Setting order");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Success");
            socketClient.emit("invalidate", { username: userData?.encUser });
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!order || !over || active.id === over.id) {
            return setActiveId(null);
        }

        const oldIndex = order.findIndex((id) => id === active.id);
        const newIndex = order.findIndex((id) => id === over.id);
        setOrder((oldOrder) => {
            if (!oldOrder) {
                return oldOrder;
            }

            const newOrder = arrayMove(oldOrder, oldIndex, newIndex);
            changeOrder(newOrder);
            return newOrder;
        });
    }
    return (
        <>
            <ul className="flex flex-col gap-3 rounded border border-slate-400 bg-slate-950 p-5">
                <DndContext
                    onDragStart={(event) => {
                        const { active } = event;
                        setActiveId(active.id.toString());
                    }}
                    onDragEnd={onDragEnd}
                    sensors={sensors}
                    collisionDetection={closestCorners}
                >
                    <SortableContext
                        strategy={verticalListSortingStrategy}
                        items={order ?? []}
                    >
                        {order?.map((id) => {
                            return (
                                <SortableModQueueEntry
                                    key={id}
                                    id={id}
                                    setCurrent={setCurrent}
                                    changeEntry={changeEntry}
                                    modalChangeRef={modalChangeRef}
                                    modalDeleteRef={modalDeleteRef}
                                    setSelectedEntry={setSelectedEntry}
                                />
                            );
                        })}
                    </SortableContext>
                    <DragOverlay>
                        {activeId !== null ? (
                            <ModQueueEntry
                                className="opacity-90"
                                id={activeId}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </ul>
            <ModalEdit
                modalRef={modalChangeRef}
                entry={selectedEntry}
                changeEntry={changeEntry}
            />
            <ModalDelete
                modalRef={modalDeleteRef}
                id={selectedEntry?.id}
                songName={selectedEntry?.songName}
                donorName={selectedEntry?.donorName}
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
    const { data: userData } = clientAPI.getAuth.useQuery();
    const { mutate: deleteEntry } = clientAPI.queue.delete.useMutation({
        onMutate() {
            toast.loading("Deleting");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Deleted");
            modalRef.current?.close();
            socketClient.emit("invalidate", { username: userData?.encUser });
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
    changeEntry: (entry: ChangedQueueEntry) => void;
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
