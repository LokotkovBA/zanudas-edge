import { forwardRef, type ChangeEvent } from "react";
import { EntryNumber } from "./EntryNumber";
import type { ChangedQueueEntry, QueueEntry } from "~/drizzle/types";
import { clientAPI } from "~/client/ClientProvider";
import { LikeBlock } from "./LikeBlock";
import { CheckBox } from "~/components/utils/CheckBox";
import { type SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { type DraggableAttributes } from "@dnd-kit/core";
import clsx from "clsx";
import { GripVertical } from "~/svg/GripVertical";

type ModQueueEntryProps = {
    style?: {
        transform: string | undefined;
        transition: string | undefined;
    };
    className?: string;
    listeners?: SyntheticListenerMap;
    attributes?: DraggableAttributes;
    id: string;
    changeEntry?: (entry: ChangedQueueEntry) => void;
    setSelectedEntry?: (entry: QueueEntry) => void;
    setCurrent?: (value: { id: number; value: boolean }) => void;
    modalDeleteRef?: React.RefObject<HTMLDialogElement>;
    modalChangeRef?: React.RefObject<HTMLDialogElement>;
};

export const ModQueueEntry = forwardRef<HTMLLIElement, ModQueueEntryProps>(
    function ModQueueEntry(
        {
            className,
            style,
            id,
            changeEntry,
            setCurrent,
            setSelectedEntry,
            modalDeleteRef,
            modalChangeRef,
            listeners,
            attributes,
        },
        ref,
    ) {
        const { data: queueData } = clientAPI.queue.getAll.useQuery();
        const queueEntry = queueData?.map.get(id);
        if (!queueEntry || !queueData) {
            return <></>;
        }

        const index = queueData.order.findIndex((entry) => entry === id);

        function changeHandler(event: ChangeEvent<HTMLInputElement>) {
            changeEntry?.({
                id: entry.id,
                [event.target.name]: event.target.checked ? 1 : 0,
            });
        }

        const { queue: entry, userLikes } = queueEntry;
        return (
            <li
                style={style}
                ref={ref}
                className={clsx(
                    "grid grid-cols-mobileQueue gap-2 rounded border border-sky-400 bg-sky-950 p-2 sm:grid-cols-queue",
                    className,
                )}
            >
                <h2 className="col-span-2 flex items-start gap-2 sm:col-span-1">
                    <button
                        className={clsx("rounded py-1", {
                            "cursor-grab hover:bg-slate-700": !!style,
                            "cursor-grabbing bg-slate-800": !style,
                        })}
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical size="2rem" className="fill-white" />
                    </button>
                    <EntryNumber
                        number={index + 1}
                        current={!!entry.current}
                        visible={!!entry.visible}
                        played={!!entry.played}
                    />
                    {entry.artist} - {entry.songName}
                </h2>
                <button
                    onClick={() => {
                        setSelectedEntry?.(entry);
                        modalDeleteRef?.current?.showModal();
                    }}
                    className="self-start justify-self-end rounded-full border border-transparent bg-sky-800 p-2 hover:border-sky-400"
                >
                    ❌
                </button>
                <LikeBlock
                    songId={entry.id}
                    count={entry.likeCount}
                    value={userLikes ? userLikes.value : 0}
                    className="justify-self-end"
                />
                <form className="col-span-2 grid grid-cols-2 items-center gap-x-1 gap-y-2 justify-self-end sm:col-span-1">
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
                            changeEntry?.({
                                id: entry.id,
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
                            changeEntry?.({
                                id: entry.id,
                                played: oldChecked ? 0 : 1,
                            });
                        }}
                    />

                    <div className="justify-self-end">
                        <input
                            className="hidden"
                            onChange={(event) => {
                                setCurrent?.({
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
                            setCurrent?.({
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
                            changeEntry?.({
                                id: entry.id,
                                willAdd: oldChecked ? 0 : 1,
                            });
                        }}
                    />
                </form>
                <button
                    onClick={() => {
                        setSelectedEntry?.(entry);
                        modalChangeRef?.current?.showModal();
                    }}
                    className="col-span-3 rounded border border-transparent bg-sky-800 p-2 hover:border-sky-400 sm:col-span-2"
                >
                    Open edit
                </button>
            </li>
        );
    },
);
