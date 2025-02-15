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

    const selectedDate = date.getUTCDate();
    date.setUTCDate(0);
    const toMonday = date.getUTCDay() - 1;
    const lastDateOfPrevMonth = date.getUTCDate();
    if (toMonday >= 0) {
        date.setUTCDate(lastDateOfPrevMonth - toMonday);
        arrayOfDays[toMonday] = lastDateOfPrevMonth;
    } else {
        arrayOfDays[0] = 1;
        arrayOfMonths[0] = 0;
    }
    const firstDay = date.getUTCDate();
    let i = 0;

    while (arrayOfDays[i] === 0) {
        arrayOfDays[i] = firstDay + i;
        i++;
    }

    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 2);
    date.setUTCDate(0);
    const lastDateOfCurMonth = date.getUTCDate();
    let daysToAdd = date.getUTCDay();
    if (daysToAdd !== 0) {
        daysToAdd = 7 - daysToAdd;
    }

    const today = new Date();
    let todayIndex = -1;
    let todayDate = -1;
    if (
        today.getUTCMonth() === date.getUTCMonth() &&
        today.getUTCFullYear() === date.getUTCFullYear()
    ) {
        todayDate = today.getUTCDate();
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
    date.setUTCDate(selectedDate);
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
