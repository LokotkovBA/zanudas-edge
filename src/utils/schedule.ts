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

export function weeekReducer(
    state: { timeRange: readonly [number, number]; currentDate: Date },
    {
        type,
        payload,
    }: {
        type: "Prev" | "Next" | "NewRange";
        payload?: readonly [number, number];
    },
) {
    let diff = 7;

    switch (type) {
        case "Prev":
            diff = -7;
        //falls through
        case "Next":
            state.currentDate.setDate(state.currentDate.getDate() + diff);
            const timeRange = getTimeRange(state.currentDate);

            return {
                currentDate: state.currentDate,
                timeRange,
            };
        case "NewRange":
            if (!payload) {
                break;
            }

            return {
                ...state,
                timeRange: payload,
            };
        default:
            break;
    }

    return state;
}

export function generateDays(weekStartTimestamp: number) {
    const startDate = new Date(weekStartTimestamp);
    const out: { dayNumber: number; dayWeek: string }[] = [];

    for (const day of days) {
        out.push({ dayNumber: startDate.getDate(), dayWeek: day });
        startDate.setDate(startDate.getDate() + 1);
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
    let dayDiff = weekStart.getDay() - 1;
    if (dayDiff < 0) {
        dayDiff = 6;
    }
    weekStart.setDate(weekStart.getDate() - dayDiff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return [weekStart.getTime(), weekEnd.getTime()] as const;
}

export function getDay(date: Date) {
    const day = date.getDay();
    return day === 0 ? 7 : day;
}

export function fromZanudasToLocalHour(hour: number, date: Date) {
    const localHourDiff = Math.floor(date.getTimezoneOffset() / 60);
    return hour - 3 - localHourDiff;
}
