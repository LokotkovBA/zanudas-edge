import { useEffect, useState } from "react";
import { getCalendarDates } from "~/utils/calendar";

export function useCalendar(date: Date, dateSetter: (date: Date) => void) {
    const [selectedMonth, setSelectedMonth] = useState(date.getUTCMonth());
    const [userSelectedDateIndex, setUserSelectedDateIndex] = useState(0);
    const [dateData, setDateData] = useState(() => {
        const dateData = getCalendarDates(date);
        setUserSelectedDateIndex(dateData.todayIndex);
        return dateData;
    });

    useEffect(() => {
        const newDateData = getCalendarDates(date);
        setUserSelectedDateIndex(newDateData.userSelectedDay);
        setDateData(newDateData);
        setSelectedMonth(date.getUTCMonth());
    }, [date]);

    function incrementMonth(dif: number, userSelectedDay?: number) {
        let newMonth = date.getUTCMonth() + dif;
        if (newMonth < 0) {
            newMonth = 11;
            date.setUTCFullYear(date.getUTCFullYear() - 1);
        } else if (newMonth > 11) {
            newMonth = 0;
            date.setUTCFullYear(date.getUTCFullYear() + 1);
        }
        date.setUTCMonth(newMonth);
        if (date.getUTCMonth() !== newMonth) {
            date.setUTCDate(0);
        }
        if (userSelectedDay) {
            date.setUTCDate(userSelectedDay);
        }
        updateDate();
    }

    function selectMonth(monthIndex: number) {
        date.setUTCMonth(monthIndex);
        if (date.getUTCMonth() !== monthIndex) {
            date.setUTCDate(0);
        }
        updateDate();
    }

    function selectYear(year: number) {
        const curMonth = date.getUTCMonth();
        date.setUTCFullYear(year);
        if (curMonth !== date.getUTCMonth()) {
            date.setUTCDate(0);
        }
        updateDate();
    }

    function updateDate() {
        dateSetter(new Date(date.toUTCString()));
    }

    return {
        updateDate,
        dateData,
        selectedMonth,
        incrementMonth,
        selectMonth,
        userSelectedDateIndex,
        setUserSelectedDateIndex,
        selectYear,
        selectedYear: date.getUTCFullYear(),
    } as const;
}
