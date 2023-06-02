import clsx from "clsx";
import { getYearsRange } from "~/utils/calendar";

type YearPickerProps = {
    selectYear: (year: number) => void;
    changeMode: (mode: number) => void;
    selectedYear: number;
};

export function YearPicker({
    selectedYear,
    selectYear,
    changeMode,
}: YearPickerProps) {
    const yearsRange = getYearsRange(selectedYear);

    function onYearClick(year: number) {
        selectYear(year);
        changeMode(0);
    }

    return (
        <section className="grid h-60 grid-cols-3 px-2">
            {yearsRange.map((year) => (
                <button
                    key={year}
                    className={clsx("my-2 h-6 rounded border-2 text-xs", {
                        "border-sky-500 bg-sky-700 font-semibold text-white":
                            year === selectedYear,
                        "border-transparent text-neutral-200 hover:bg-neutral-800":
                            year !== selectedYear,
                    })}
                    onClick={() => onYearClick(year)}
                >
                    {year}
                </button>
            ))}
        </section>
    );
}
