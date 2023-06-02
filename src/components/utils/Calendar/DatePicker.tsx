import { ChevronLeft } from "~/svg/ChevronLeft";
import { ChevronRight } from "~/svg/ChevronRight";
import clsx from "clsx";
import { type useCalendar } from "./hooks/useCalendar";
import { daysOfWeek, months } from "~/utils/calendar";

type DatePickerProps = {
    selectedDate: Date;
    updateDate: () => void;
    calendarData: ReturnType<typeof useCalendar>;
    changeMode: React.Dispatch<React.SetStateAction<number>>;
    modalRef: React.RefObject<HTMLDialogElement>;
};

export function DatePicker({
    modalRef,
    selectedDate,
    updateDate,
    changeMode,
    calendarData: {
        dateData: { arrayOfDays, todayIndex, arrayOfMonths },
        selectedMonth,
        selectedYear,
        setUserSelectedDateIndex,
        incrementMonth,
        userSelectedDateIndex,
    },
}: DatePickerProps) {
    function onDateClick(index: number) {
        modalRef.current?.close();
        const userSelectedDay = arrayOfDays[index];
        if (!userSelectedDay) {
            return;
        }
        const selectedMonth = arrayOfMonths[index];
        if (!selectedMonth) {
            selectedDate.setUTCDate(userSelectedDay);
            updateDate();
            setUserSelectedDateIndex(index);
            return;
        }

        incrementMonth(selectedMonth, userSelectedDay);
    }

    return (
        <section className="flex flex-col justify-between gap-3 md:pr-0">
            <h3 className="mb-2 flex gap-2">
                <button
                    onClick={() => incrementMonth(-1)}
                    className="mr-auto rounded-lg duration-200 hover:scale-125 hover:bg-neutral-800"
                >
                    <ChevronLeft size="1.5rem" className="fill-neutral-50" />
                </button>
                <button
                    onClick={() => changeMode(1)}
                    className="text-xl font-medium hover:cursor-pointer hover:text-sky-500 focus:underline"
                >
                    {months[selectedMonth]}
                </button>
                <button
                    onClick={() => changeMode(2)}
                    className="text-xl font-light text-neutral-400 hover:cursor-pointer hover:text-sky-500 focus:underline"
                >
                    {selectedYear}
                </button>
                <button
                    onClick={() => incrementMonth(1)}
                    className="ml-auto rounded-lg duration-200 hover:scale-125 hover:bg-neutral-800"
                >
                    <ChevronRight size="1.5rem" className="fill-neutral-50" />
                </button>
            </h3>
            <div className="mb-1 mt-auto grid grid-cols-7 justify-items-center gap-1">
                {daysOfWeek.map((day) => {
                    return (
                        <div key={day} className="text-neutral-400">
                            {day}
                        </div>
                    );
                })}
            </div>
            <div
                tabIndex={0}
                className="grid grid-cols-7 justify-items-center gap-1 rounded-md"
            >
                {arrayOfDays.map((date, index) => {
                    return (
                        <button
                            onClick={() => onDateClick(index)}
                            className={clsx(
                                "w-8 cursor-pointer border-2 p-1.5 text-center leading-none duration-200 hover:scale-125 hover:font-bold hover:underline",
                                {
                                    "font-bold text-sky-500":
                                        index === todayIndex &&
                                        index !== userSelectedDateIndex,
                                    "rounded border-sky-500 bg-sky-700 text-white":
                                        index === userSelectedDateIndex,
                                    "border-transparent":
                                        index !== userSelectedDateIndex,
                                    "text-neutral-400":
                                        arrayOfMonths[index] !== 0 &&
                                        (index !== todayIndex ||
                                            index === userSelectedDateIndex),
                                },
                            )}
                            key={index}
                        >
                            {date}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
