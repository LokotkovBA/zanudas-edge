export const daysOfWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;

export const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

export function getCalendarDates(selectedDate: Date) {
    const arrayOfDays = new Array<number>(35).fill(0);
    const arrayOfMonths = new Array<number>(35).fill(-1);

    const [userSelectedDay, todayIndex] = setCalendarDates(
        selectedDate,
        arrayOfDays,
        arrayOfMonths,
    );

    return { arrayOfDays, arrayOfMonths, userSelectedDay, todayIndex } as const;
}

function setCalendarDates(
    date: Date,
    arrayOfDays: number[],
    arrayOfMonths: number[],
) {
    let selectedDateIndex = 0;

    const selectedDate = date.getDate();
    date.setDate(0);
    const toMonday = date.getDay() - 1;
    const lastDateOfPrevMonth = date.getDate();
    if (toMonday >= 0) {
        date.setDate(lastDateOfPrevMonth - toMonday);
        arrayOfDays[toMonday] = lastDateOfPrevMonth;
    } else {
        arrayOfDays[0] = 1;
        arrayOfMonths[0] = 0;
    }
    const firstDay = date.getDate();
    let i = 0;

    while (arrayOfDays[i] === 0) {
        arrayOfDays[i] = firstDay + i;
        i++;
    }

    date.setDate(1);
    date.setMonth(date.getMonth() + 2);
    date.setDate(0);
    const lastDateOfCurMonth = date.getDate();
    let daysToAdd = date.getDay();
    if (daysToAdd !== 0) {
        daysToAdd = 7 - daysToAdd;
    }

    const today = new Date();
    let todayIndex = -1;
    let todayDate = -1;
    if (
        today.getMonth() === date.getMonth() &&
        today.getFullYear() === date.getFullYear()
    ) {
        todayDate = today.getDate();
    }

    let curDate = arrayOfDays[0] === 1 ? 2 : 1;
    i++;
    while (curDate <= lastDateOfCurMonth) {
        arrayOfDays[i] = curDate;
        arrayOfMonths[i] = 0;
        if (curDate === selectedDate) {
            selectedDateIndex = i;
        }
        if (curDate === todayDate) {
            todayIndex = i;
        }
        curDate++;
        i++;
    }
    curDate = 1;
    if (arrayOfDays.length > 35) {
        arrayOfDays.length += daysToAdd;
        arrayOfMonths.length += daysToAdd;
    }

    while (i < arrayOfDays.length) {
        arrayOfDays[i] = curDate;
        arrayOfMonths[i] = 1;
        curDate++;
        i++;
    }
    date.setDate(selectedDate);
    return [selectedDateIndex, todayIndex] as const;
}
export function getYearsRange(selectedYear: number) {
    let startYear = selectedYear - 7;
    const range = new Array<number>(15);
    for (let i = 0; i < 15; i++) {
        range[i] = startYear;
        startYear++;
    }
    return range;
}
