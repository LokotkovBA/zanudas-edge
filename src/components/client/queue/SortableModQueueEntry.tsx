import { useSortable } from "@dnd-kit/sortable";
import type { ChangedQueueEntry, QueueEntry } from "~/drizzle/types";
import { CSS } from "@dnd-kit/utilities";
import { ModQueueEntry } from "./ModQueueEntry";
import { useEffect, useState } from "react";

type SortableModQueueEntryProps = {
    id: number;
    changeEntry: (entry: ChangedQueueEntry) => void;
    setSelectedEntry: (entry: QueueEntry) => void;
    setCurrent: (value: { id: number; value: boolean; index: number }) => void;
    modalDeleteRef: React.RefObject<HTMLDialogElement>;
    modalChangeRef: React.RefObject<HTMLDialogElement>;
};
export function SortableModQueueEntry(props: SortableModQueueEntryProps) {
    const {
        listeners,
        setNodeRef,
        transform,
        transition,
        attributes: initialAttributes,
    } = useSortable({
        id: props.id,
    });

    const [attributes, setAttributes] = useState({
        ...initialAttributes,
        "aria-describedby": "",
    });
    useEffect(() => {
        setAttributes(initialAttributes); // HACK: fixes a hydration bug in Next.JS
    }, [initialAttributes]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <ModQueueEntry
            {...props}
            listeners={listeners}
            attributes={attributes}
            style={style}
            ref={setNodeRef}
        />
    );
}
