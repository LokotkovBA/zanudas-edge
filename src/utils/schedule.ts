import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { createQueryString } from "./routing";
import { type ReadonlyURLSearchParams } from "next/navigation";

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

export const eventLinks = {
    Variety: "https://twitch.tv/zanuda",
    Music: "https://twitch.tv/zanuda",
    Free: "https://t.me/etzalert",
    Moroshka: "https://twitch.tv/koshkamoroshka",
    VKPlay: "https://vkplay.live/zanuda",
};

export function getRangeParams(
    currentWeekTimestamp: number,
    type: "Prev" | "Next",
    searchParams: ReadonlyURLSearchParams,
) {
    const diff = type === "Next" ? 7 : -7;

    const date = new Date(currentWeekTimestamp);
    date.setDate(date.getDate() + diff);
    const [, , weekStartTimestamp, weekEndTimestamp] = getTimeRange(date);
    return (
        "?" +
        createQueryString(
            "weekRange",
            searchParams,
            `${weekStartTimestamp}-${weekEndTimestamp}`,
        )
    );
}

export function switchWeek(
    currentWeekTimestamp: number,
    type: "Prev" | "Next",
    router: AppRouterInstance,
    searchParams: ReadonlyURLSearchParams,
) {
    router.push(getRangeParams(currentWeekTimestamp, type, searchParams));
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

    return [
        weekStart,
        weekEnd,
        weekStart.getTime(),
        weekEnd.getTime(),
    ] as const;
}

export function getUTCWeekDay(date: Date) {
    let weekDay = date.getUTCDay();
    if (weekDay === 0) {
        weekDay = 7;
    }
    return weekDay === 0 ? 7 : weekDay;
}

export function toUTCHour(hour: number, localHourDiff: number) {
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

export function getIsCurrentWeek(
    todayTimestamp: number,
    weekStartTimestamp: number,
    weekEndTimestamp: number,
) {
    return (
        weekStartTimestamp <= todayTimestamp &&
        todayTimestamp <= weekEndTimestamp
    );
}
