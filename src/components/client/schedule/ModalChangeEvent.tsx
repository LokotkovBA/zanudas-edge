import {
    type FormEvent,
    useRef,
    useState,
    useLayoutEffect,
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
} from "react";
import { generateHourArray } from "./WeekTable";
import { clientAPI } from "~/client/ClientProvider";
import { toast } from "react-hot-toast";
import { buttonStyles } from "~/components/styles/button";
import { Calendar } from "./Calendar";
import { searchBarStyles } from "~/components/styles/searchBar";
import { deleteButtonStyles } from "~/components/styles/deleteButton";
import { Cross } from "~/svg/Cross";
import { type EventEntry } from "~/server/routers/events";

type ModalAddProps = {
    event: EventEntry;
    setEvent: Dispatch<SetStateAction<EventEntry>>;
    modalRef: React.RefObject<HTMLDialogElement>;
};

export function ModalChangeEvent({
    modalRef,
    setEvent,
    event: { id, title, description, modifier, startDate, endDate },
}: ModalAddProps) {
    const calendarRef = useRef<HTMLDialogElement>(null);

    const [startHourValue, setStartHourValue] = useState("10");
    const [endHourValue, setEndHourValue] = useState("11");

    useLayoutEffect(() => {
        setStartHourValue(startDate.getHours().toString());
    }, [startDate]);

    useLayoutEffect(() => {
        setEndHourValue(endDate.getHours().toString());
    }, [endDate]);

    const hourArrayRef = useRef(generateHourArray());

    const { mutate: changeEvent } = clientAPI.events.change.useMutation({
        onMutate() {
            toast.loading("Changing");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Changed");
            modalRef.current?.close();
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    const { mutate: deleteEvent } = clientAPI.events.delete.useMutation({
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

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const startHour = parseInt(startHourValue);
        const endHour = parseInt(endHourValue);

        if (endHour < startHour || endHour === startHour) {
            return toast.error("Incorrect range");
        }
        if (title === "") {
            return toast.error("Empty title");
        }

        startDate.setHours(startHour, 0, 0, 0);
        endDate.setHours(endHour, 0, 0, 0);
        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();

        setEvent((prev) => ({
            ...prev,
            startTimestamp,
            endTimestamp,
        }));

        changeEvent({
            id,
            title,
            description,
            modifier,
            startTimestamp,
            endTimestamp,
        });
    }

    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        setEvent((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    }

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        setEvent((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    }

    return (
        <>
            <dialog
                ref={modalRef}
                className="border border-slate-500 bg-slate-900 text-slate-50"
            >
                <section className="mb-2 flex items-center gap-2">
                    <button
                        onClick={() => modalRef.current?.close()}
                        className={`${buttonStyles} mr-auto`}
                    >
                        Close
                    </button>
                    <label
                        onClick={() => calendarRef.current?.showModal()}
                        className="mr-auto cursor-pointer"
                    >
                        {startDate.toDateString()}
                    </label>
                    <button
                        className={buttonStyles}
                        onClick={() => calendarRef.current?.showModal()}
                    >
                        Set date
                    </button>
                    <button
                        onClick={() => deleteEvent(id)}
                        className={deleteButtonStyles}
                    >
                        <Cross
                            id={`delete-event-${id}`}
                            className="fill-slate-50"
                            size="1.5rem"
                        />
                    </button>
                </section>
                <form
                    onSubmit={onSubmit}
                    className="grid-cols-songEdit grid items-center gap-2"
                >
                    <label htmlFor="title-starthour">Range</label>
                    <div className="flex justify-around">
                        <select
                            value={startHourValue}
                            onChange={(event) =>
                                setStartHourValue(event.target.value)
                            }
                            className="border border-slate-400 bg-slate-950 p-2"
                            id="select-starthour"
                        >
                            {hourArrayRef.current.map((hour) => (
                                <option key={hour} value={hour}>
                                    {hour}:00
                                </option>
                            ))}
                        </select>
                        <select
                            value={endHourValue}
                            onChange={(event) =>
                                setEndHourValue(event.target.value)
                            }
                            className="border border-slate-400 bg-slate-950 p-2"
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
                        value={modifier}
                        onChange={onSelectChange}
                        name="modifier"
                        className="rounded border border-slate-400 bg-slate-950 p-2"
                    >
                        {modifierArray.map((modifier) => (
                            <option key={modifier} value={modifier}>
                                {modifier}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="title-add">Title</label>
                    <input
                        onChange={onInputChange}
                        value={title}
                        name="title"
                        id="title-add"
                        className={searchBarStyles}
                        type="text"
                    />
                    <label htmlFor="description-add">Description</label>
                    <input
                        onChange={onInputChange}
                        value={description}
                        name="description"
                        id="description-add"
                        className={searchBarStyles}
                        type="text"
                    />
                    <button
                        type="submit"
                        className={`${buttonStyles} col-span-2`}
                    >
                        Change
                    </button>
                </form>
                <Calendar
                    modalRef={calendarRef}
                    selectedDate={startDate}
                    dateSetter={(date) =>
                        setEvent((prev) => ({ ...prev, startDate: date }))
                    }
                />
            </dialog>
        </>
    );
}

const modifierArray = ["Game", "Music", "Free", "Moroshka"];
