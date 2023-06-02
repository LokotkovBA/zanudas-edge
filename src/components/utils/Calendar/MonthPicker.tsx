import clsx from "clsx";
import { months } from "~/utils/calendar";

type MonthPickerProps = {
    selectedMonth: number;
    selectMonth: (monthIndex: number) => void;
    changeMode: React.Dispatch<React.SetStateAction<number>>;
};

export function MonthPicker({
    selectMonth,
    changeMode,
    selectedMonth,
}: MonthPickerProps) {
    function onMonthClick(monthIndex: number) {
        selectMonth(monthIndex);
        changeMode(0);
    }

    return (
        <section className="grid h-60 grid-cols-3 px-2 pt-4">
            {months.map((month, index) => (
                <button
                    key={month}
                    className={clsx("my-2 h-6 rounded border-2 text-xs", {
                        "border-sky-500 bg-sky-700 font-semibold text-white":
                            index === selectedMonth,
                        "border-transparent text-neutral-200 hover:bg-neutral-800":
                            index !== selectedMonth,
                    })}
                    onClick={() => onMonthClick(index)}
                >
                    {month}
                </button>
            ))}
        </section>
    );
}
