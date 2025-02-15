"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import type { QueueEntry } from "~/drizzle/types";
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
import { ModalChangeQueueEntry } from "./ModalChangeQueueEntry";
import { ModalDeleteQueueEntry } from "./ModalDeleteQueueEntry";
import { emptyEntry } from "~/utils/queue";

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
        onSuccess(index) {
            toast.dismiss();
            toast.success("Changed");

            socketClient.emit("change current", {
                username: userData?.encUser,
                message: {
                    queueNumber: index,
                },
            });
            socketClient.emit("invalidate", { username: userData?.encUser });
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    const [selectedEntry, setSelectedEntry] = useState<QueueEntry>(emptyEntry);
    const modalChangeRef = useRef<HTMLDialogElement>(null);
    const modalDeleteRef = useRef<HTMLDialogElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const [activeId, setActiveId] = useState<number | null>(null);
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
        onSuccess(currentQueueNumber) {
            toast.dismiss();
            toast.success("Success");
            if (currentQueueNumber !== -1) {
                socketClient.emit("change current", {
                    username: userData?.encUser,
                    message: { queueNumber: currentQueueNumber + 1 },
                });
            }

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
                        setActiveId(parseInt(active.id.toString()));
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
            <ModalChangeQueueEntry
                modalRef={modalChangeRef}
                entry={selectedEntry}
                changeEntry={changeEntry}
                modifyEntry={setSelectedEntry}
            />
            <ModalDeleteQueueEntry
                modalRef={modalDeleteRef}
                id={selectedEntry?.id}
                songName={selectedEntry?.songName}
                donorName={selectedEntry?.donorName}
            />
        </>
    );
}
