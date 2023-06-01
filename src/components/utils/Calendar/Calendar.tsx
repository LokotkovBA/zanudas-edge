import { useState } from "react";
import { MonthPicker } from "./MonthPicker";
import { DatePicker } from "./DatePicker";
import { YearPicker } from "./YearPicker";
import { useCalendar } from "./hooks/useCalendar";

type CalendarProps = {
    defaultMode?: number;
    selectedDate: Date;
    dateSetter: (date: Date) => void;
    modalRef: React.RefObject<HTMLDialogElement>;
};

export default function Calendar({
    modalRef,
    selectedDate,
    dateSetter,
    defaultMode = 0,
}: CalendarProps) {
    const calendarData = useCalendar(selectedDate, dateSetter);
    const [modeSelect, setModeSelect] = useState(defaultMode);

    return (
        <dialog
            ref={modalRef}
            className="w-64 rounded border border-slate-400 bg-slate-900 p-4 text-xs text-slate-50"
        >
            {modeSelect === 0 && (
                <DatePicker
                    calendarData={calendarData}
                    changeMode={setModeSelect}
                    updateDate={calendarData.updateDate}
                    selectedDate={selectedDate}
                    modalRef={modalRef}
                />
            )}
            {modeSelect === 1 && (
                <MonthPicker
                    selectMonth={calendarData.selectMonth}
                    changeMode={setModeSelect}
                    selectedMonth={calendarData.selectedMonth}
                />
            )}
            {modeSelect === 2 && (
                <YearPicker
                    selectYear={calendarData.selectYear}
                    changeMode={setModeSelect}
                    selectedYear={calendarData.selectedYear}
                />
            )}
        </dialog>
    );
}
