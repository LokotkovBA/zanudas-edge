import { ChevronLeft } from "~/svg/ChevronLeft";
import { ChevronRight } from "~/svg/ChevronRight";
import { daysOfWeek, months } from "./utils";
import clsx from "clsx";
import { type useCalendar } from "./useCalendar";

type DatePickerProps = {
    selectedDate: Date;
    updateDate: () => void;
    calendarData: ReturnType<typeof useCalendar>;
    changeMode: React.Dispatch<React.SetStateAction<number>>;
    modalRef: React.RefObject<HTMLDialogElement>;
};
const arrowStyles =
    "hover:bg-neutral-800 rounded-lg duration-200 hover:scale-125";
const headingTextStyles =
    "text-xl focus:underline hover:text-sky-500 hover:cursor-pointer";

function dateStyles(
    isToday: boolean,
    isUserSelected: boolean,
    isSelectedMonth: boolean,
) {
    const isTodayNotSelected = !isUserSelected && isToday;
    return clsx(
        "cursor-pointer border-2 duration-200 hover:scale-125 hover:font-bold hover:underline p-1.5 leading-none w-8 text-center",
        {
            "text-sky-500 font-bold": isTodayNotSelected,
            "text-white bg-sky-700 border-sky-500 rounded": isUserSelected,
            "border-transparent": !isUserSelected,
            "text-neutral-400": !isSelectedMonth && !isTodayNotSelected,
        },
    );
}

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
            selectedDate.setDate(userSelectedDay);
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
                    className={`mr-auto ${arrowStyles}`}
                >
                    <ChevronLeft size="1.5rem" className="fill-neutral-50" />
                </button>
                <button
                    onClick={() => changeMode(1)}
                    className={`font-medium ${headingTextStyles}`}
                >
                    {months[selectedMonth]}
                </button>
                <button
                    onClick={() => changeMode(2)}
                    className={`font-light text-neutral-400 ${headingTextStyles}`}
                >
                    {selectedYear}
                </button>
                <button
                    onClick={() => incrementMonth(1)}
                    className={`ml-auto ${arrowStyles}`}
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
                            className={dateStyles(
                                index === todayIndex,
                                index === userSelectedDateIndex,
                                arrayOfMonths[index] === 0,
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
