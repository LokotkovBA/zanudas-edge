import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context";

export const modifierArray = [
    "Variety",
    "Music",
    "Free",
    "Moroshka",
    "VKPlay",
] as const;

export const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export function getRangeParams(
    currentWeekTimestamp: number,
    type: "Prev" | "Next",
) {
    const diff = type === "Next" ? 7 : -7;

    const date = new Date(currentWeekTimestamp);
    date.setDate(date.getDate() + diff);
    const timeRange = getTimeRange(date);
    return `/?weekRange=${timeRange[0]}-${timeRange[1]}`;
}

export function switchWeek(
    currentWeekTimestamp: number,
    type: "Prev" | "Next",
    router: AppRouterInstance,
) {
    router.push(getRangeParams(currentWeekTimestamp, type));
}

export function generateDays(weekStartTimestamp: number) {
    const startDate = new Date(weekStartTimestamp);
    const out: { dayNumber: number; dayWeek: string }[] = [];

    for (const day of days) {
        out.push({ dayNumber: startDate.getUTCDate(), dayWeek: day });
        startDate.setUTCDate(startDate.getUTCDate() + 1);
    }

    return out;
}

export function generateHourArray(startHour = 10, size = 13) {
    const hourArray: number[] = new Array(size);
    for (let i = 0; i < size; i++) {
        const hour = (startHour + i) % 24;
        hourArray[i] = hour < 0 ? 24 + hour : hour;
    }

    return hourArray;
}

export function getTimeRange(weekStart = new Date()) {
    const dayDiff = getUTCWeekDay(weekStart) - 1;

    weekStart.setUTCDate(weekStart.getUTCDate() - dayDiff);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    return [weekStart.getTime(), weekEnd.getTime()] as const;
}

export function getUTCWeekDay(date: Date) {
    let weekDay = date.getUTCDay();
    if (weekDay === 0) {
        weekDay = 7;
    }
    return weekDay === 0 ? 7 : weekDay;
}

export function toUTCHour(hour: number, localHourDiff: number) {
    console.log(hour, localHourDiff);
    const utcHour = (hour + localHourDiff) % 24;

    return utcHour < 0 ? utcHour + 24 : utcHour;
}

export function fromZanudasToLocalHour(hour: number, date = new Date()) {
    const localHourDiff = Math.floor(date.getTimezoneOffset() / 60);
    let localHour = hour - 3 - localHourDiff; // NOTE: Zanuda's local time zone is UTC +3
    if (localHour < 0) {
        localHour += 24;
    }

    return localHour;
}
