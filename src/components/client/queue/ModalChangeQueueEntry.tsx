import { type ChangeEvent } from "react";
import { buttonStyles } from "~/components/styles/button";
import { inputStyles } from "~/components/styles/input";
import { type ChangedQueueEntry, type QueueEntry } from "~/drizzle/types";

type ModalChangeQueueEntryProps = {
    entry: QueueEntry | null;
    modalRef: React.RefObject<HTMLDialogElement>;
    changeEntry: (entry: ChangedQueueEntry) => void;
    modifyEntry: (
        changeFunction: (oldEntry: QueueEntry | null) => QueueEntry | null,
    ) => void;
};

export function ModalChangeQueueEntry({
    entry,
    modalRef,
    changeEntry,
    modifyEntry,
}: ModalChangeQueueEntryProps) {
    function onChange(
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) {
        modifyEntry((prev) => {
            const value =
                event.target.id === "donateAmount"
                    ? parseInt(event.target.value)
                    : event.target.value;
            return prev !== null
                ? {
                      ...prev,
                      [event.target.id]: value,
                  }
                : null;
        });
    }

    return (
        <dialog
            className="border border-slate-500 bg-slate-900 text-slate-50"
            onSubmit={(event) => {
                event.preventDefault();
                if (!entry) {
                    return;
                }
                changeEntry(entry);
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
                    value={entry?.artist}
                    onChange={onChange}
                    id="artist"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="songName">Song name</label>
                <input
                    value={entry?.songName}
                    onChange={onChange}
                    id="songName"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="tag">Tag</label>
                <input
                    value={entry?.tag}
                    onChange={onChange}
                    id="tag"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="donorName">Donor name</label>
                <input
                    value={entry?.donorName}
                    onChange={onChange}
                    id="donorName"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="donateAmount">Donate amount</label>
                <input
                    value={entry?.donateAmount}
                    onChange={onChange}
                    id="donateAmount"
                    className={inputStyles}
                    type="number"
                />
                <label htmlFor="currency">Currency</label>
                <input
                    value={entry?.currency}
                    onChange={onChange}
                    id="currency"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="donorText">Donor message</label>
                <textarea
                    value={entry?.donorText}
                    onChange={onChange}
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
