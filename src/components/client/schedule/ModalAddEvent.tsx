import { type FormEvent, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";
import { generateHourArray, modifierArray } from "~/utils/schedule";
import { searchBarStyles } from "~/components/styles/searchBar";
import Calendar from "~/components/utils/Calendar";

type ModalAddEventProps = {
    modalRef: React.RefObject<HTMLDialogElement>;
};

export function ModalAddEvent({ modalRef }: ModalAddEventProps) {
    const calendarRef = useRef<HTMLDialogElement>(null);
    const [selectedDateValue, setSelectedDateValue] = useState(new Date());

    const startHourRef = useRef<HTMLSelectElement>(null);
    const endHourRef = useRef<HTMLSelectElement>(null);
    const modifierRef = useRef<HTMLSelectElement>(null);

    const [titleValue, setTitleValue] = useState("");
    const [descriptionValue, setDescriptionValue] = useState("");
    const hourArrayRef = useRef(generateHourArray());

    const { mutate: addEvent } = clientAPI.events.add.useMutation({
        onMutate() {
            toast.loading("Adding");
        },
        onSuccess() {
            setTitleValue("");
            setDescriptionValue("");
            toast.dismiss();
            toast.success("Added");
            modalRef.current?.close();
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const startHour = parseInt(startHourRef.current?.value ?? "");
        const endHour = parseInt(endHourRef.current?.value ?? "");
        if (endHour < startHour || endHour === startHour) {
            return toast.error("Incorrect range");
        }
        if (titleValue === "") {
            return toast.error("Empty title");
        }

        const startDate = new Date();
        const endDate = new Date();
        const selectedDateTimestamp = selectedDateValue.getTime();
        startDate.setTime(selectedDateTimestamp);
        startDate.setHours(startHour, 0, 0, 0);
        endDate.setTime(selectedDateTimestamp);
        endDate.setHours(endHour, 0, 0, 0);

        addEvent({
            title: titleValue,
            description: descriptionValue,
            modifier: modifierRef.current?.value,
            startTimestamp: startDate.getTime(),
            endTimestamp: endDate.getTime(),
        });
    }

    return (
        <>
            <dialog
                ref={modalRef}
                className="border border-slate-500 bg-slate-900 text-slate-50"
            >
                <section className="mb-2 flex items-center">
                    <button
                        onClick={() => modalRef.current?.close()}
                        className={`${buttonStyles} mr-auto`}
                    >
                        Close
                    </button>
                    <h2
                        onClick={() => calendarRef.current?.showModal()}
                        className="mr-auto cursor-pointer"
                    >
                        {selectedDateValue.toDateString()}
                    </h2>
                    <button
                        className={buttonStyles}
                        onClick={() => calendarRef.current?.showModal()}
                    >
                        Set date
                    </button>
                </section>
                <form
                    onSubmit={onSubmit}
                    className="grid-cols-songEdit grid items-center gap-2"
                >
                    <label htmlFor="range-add">Range</label>
                    <div className="flex justify-around">
                        <select
                            ref={startHourRef}
                            className="border border-slate-400 bg-slate-950 p-2"
                            defaultValue="10"
                            id="range-add"
                        >
                            {hourArrayRef.current.map((hour) => (
                                <option key={hour} value={hour}>
                                    {hour}:00
                                </option>
                            ))}
                        </select>
                        <select
                            ref={endHourRef}
                            className="border border-slate-400 bg-slate-950 p-2"
                            defaultValue="11"
                            id="select-endhour"
                        >
                            {hourArrayRef.current.map((hour) => (
                                <option key={hour} value={hour}>
                                    {hour}:00
                                </option>
                            ))}
                        </select>
                    </div>
                    <label htmlFor="modifier-add">Modifier</label>
                    <select
                        id="modifier-add"
                        ref={modifierRef}
                        className="rounded border border-slate-400 bg-slate-950 p-2"
                    >
                        {modifierArray.map((modifier) => (
                            <option key={modifier} value={modifier}>
                                {modifier}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="title-add">Title</label>
                    <textarea
                        onChange={(event) => setTitleValue(event.target.value)}
                        value={titleValue}
                        id="title-add"
                        className={searchBarStyles}
                    />
                    <label htmlFor="description-add">Description</label>
                    <input
                        onChange={(event) =>
                            setDescriptionValue(event.target.value)
                        }
                        value={descriptionValue}
                        id="description-add"
                        className={searchBarStyles}
                        type="text"
                    />
                    <button
                        type="submit"
                        className={`${buttonStyles} col-span-2`}
                    >
                        Add
                    </button>
                </form>
                <Calendar
                    modalRef={calendarRef}
                    selectedDate={selectedDateValue}
                    dateSetter={setSelectedDateValue}
                />
            </dialog>
        </>
    );
}
