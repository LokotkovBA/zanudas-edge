import {
    type FormEvent,
    useRef,
    useState,
    useLayoutEffect,
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
} from "react";
import { clientAPI } from "~/client/ClientProvider";
import { toast } from "react-hot-toast";
import { buttonStyles } from "~/components/styles/button";
import { searchBarStyles } from "~/components/styles/searchBar";
import { deleteButtonStyles } from "~/components/styles/deleteButton";
import { Cross } from "~/svg/Cross";
import { type EventEntry } from "~/utils/types/schedule";
import {
    fromZanudasToLocalHour,
    getUTCWeekDay,
    modifierArray,
    toUTCHour,
} from "~/utils/schedule";
import { inputStyles } from "~/components/styles/input";
import { ModalDeleteEvent } from "./ModalDeleteEvent";
import Calendar from "~/components/utils/Calendar";
import { useRouter } from "next/navigation";
import { useSelectHours } from "./hooks/useSelectHours";

type ModalAddProps = {
    event: EventEntry;
    setEvent: Dispatch<SetStateAction<EventEntry>>;
    modalChangeRef: React.RefObject<HTMLDialogElement>;
};

export function ModalChangeEvent({
    modalChangeRef,
    setEvent,
    event: { id, title, description, modifier, startDate, endDate },
}: ModalAddProps) {
    const calendarRef = useRef<HTMLDialogElement>(null);

    const [startHourValue, setStartHourValue] = useState(
        fromZanudasToLocalHour(10, startDate).toString(),
    );
    const [endHourValue, setEndHourValue] = useState(
        fromZanudasToLocalHour(11, startDate).toString(),
    );

    useLayoutEffect(() => {
        setStartHourValue(startDate.getHours().toString());
    }, [startDate]);

    useLayoutEffect(() => {
        setEndHourValue(endDate.getHours().toString());
    }, [endDate]);

    const hourArray = useSelectHours();
    const modalDeleteRef = useRef<HTMLDialogElement>(null);

    const router = useRouter();

    const { mutate: changeEvent } = clientAPI.events.change.useMutation({
        onMutate() {
            toast.loading("Changing");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Changed");
            modalChangeRef.current?.close();
            router.refresh();
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const localHourDiff = Math.floor(startDate.getTimezoneOffset() / 60);
        const startHour = toUTCHour(parseInt(startHourValue), localHourDiff);
        const endHour = toUTCHour(parseInt(endHourValue), localHourDiff);

        if (endHour < startHour || endHour === startHour) {
            return toast.error("Incorrect range");
        }
        if (title === "") {
            return toast.error("Empty title");
        }

        startDate.setUTCHours(startHour, 0, 0, 0);
        endDate.setUTCHours(endHour, 0, 0, 0);
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
            weekDay: getUTCWeekDay(startDate),
        });
    }

    function onChange(
        event: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) {
        setEvent((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    }

    return (
        <>
            <dialog
                ref={modalChangeRef}
                className="border border-slate-500 bg-slate-900 text-slate-50"
            >
                <section className="mb-2 flex items-center gap-2">
                    <button
                        onClick={() => modalChangeRef.current?.close()}
                        className={`${buttonStyles} mr-auto`}
                    >
                        Close
                    </button>
                    <h2
                        onClick={() => calendarRef.current?.showModal()}
                        className="mr-auto cursor-pointer"
                    >
                        {startDate.toUTCString().slice(0, 16)}
                    </h2>
                    <button
                        className={buttonStyles}
                        onClick={() => calendarRef.current?.showModal()}
                    >
                        Set date
                    </button>
                    <button
                        onClick={() => modalDeleteRef.current?.showModal()}
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
                    <label htmlFor="range-change">Range</label>
                    <div className="flex justify-around">
                        <select
                            id="range-change"
                            value={startHourValue}
                            onChange={(event) =>
                                setStartHourValue(event.target.value)
                            }
                            className="border border-slate-400 bg-slate-950 p-2"
                            name="startHour-change"
                        >
                            {hourArray.map((hour) => (
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
                            name="endHour-change"
                        >
                            {hourArray.map((hour) => (
                                <option key={hour} value={hour}>
                                    {hour}:00
                                </option>
                            ))}
                        </select>
                    </div>
                    <label htmlFor="modifier-change">Modifier</label>
                    <select
                        id="modifier-change"
                        value={modifier}
                        onChange={onChange}
                        name="modifier"
                        className="rounded border border-slate-400 bg-slate-950 p-2"
                    >
                        {modifierArray.map((modifier) => (
                            <option key={modifier} value={modifier}>
                                {modifier}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="title-change">Title</label>
                    <textarea
                        onChange={onChange}
                        value={title}
                        name="title"
                        id="title-change"
                        className={inputStyles}
                    />
                    <label htmlFor="description-change">Description</label>
                    <input
                        onChange={onChange}
                        value={description}
                        name="description"
                        id="description-change"
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
            <ModalDeleteEvent
                modalChangeRef={modalChangeRef}
                modalDeleteRef={modalDeleteRef}
                id={id}
                title={title}
            />
        </>
    );
}
