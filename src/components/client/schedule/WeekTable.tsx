"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { isAdmin } from "~/utils/privileges";
import { ModalChangeEvent } from "./ModalChangeEvent";
import { type EventEntry } from "~/server/routers/events";

export function WeekTable() {
    const [hourArray, setHourArray] = useState<number[]>([]);
    const todayRef = useRef(new Date());
    const [eventEntry, setEventEntry] = useState<EventEntry>({
        id: -1,
        startDate: todayRef.current,
        endDate: todayRef.current,
        description: "",
        title: "",
        modifier: "Game",
    });

    const firstTableHourRef = useRef(
        fromZanudasToLocalHour(10, todayRef.current),
    );
    const modalChangeRef = useRef<HTMLDialogElement>(null);
    const [weekStartTimestamp, weekEndTimestamp] = getWeekRange(
        todayRef.current,
    );

    const { data: eventsData } = clientAPI.events.getWeek.useQuery({
        weekStartTimestamp,
        weekEndTimestamp,
    });

    useEffect(() => {
        setHourArray(generateHourArray(firstTableHourRef.current, 12)); // HACK: this fixes the hydration error if the client's timezone is different from the server's
    }, []);

    return (
        <>
            <section className="grid grid-cols-1 grid-rows-5 gap-2 xl:grid-cols-8">
                {tableHeader.map((header) => (
                    <h3
                        className="hidden justify-center xl:col-auto xl:flex"
                        key={header}
                    >
                        {header}
                    </h3>
                ))}
                {hourArray.map((hour) => (
                    <h3
                        className="col-start-1 hidden self-center justify-self-end xl:block"
                        key={hour}
                    >
                        {hour}:00
                    </h3>
                ))}
                {eventsData?.map((event) => (
                    <Event
                        onClick={() => {
                            modalChangeRef.current?.showModal();
                            setEventEntry(event);
                        }}
                        key={event.id}
                        firstTableHour={firstTableHourRef.current}
                        day={getDay(event.startDate)}
                        startHour={event.startDate.getHours()}
                        endHour={event.endDate.getHours()}
                        title={event.title}
                        modifier={event.modifier}
                    />
                ))}
            </section>
            <ModalChangeEvent
                event={eventEntry}
                setEvent={setEventEntry}
                modalRef={modalChangeRef}
            />
        </>
    );
}

function getDay(date: Date) {
    const day = date.getDay();
    return day === 0 ? 7 : day;
}

function fromZanudasToLocalHour(hour: number, date: Date) {
    const localHourDiff = Math.floor(date.getTimezoneOffset() / 60);
    return hour - 3 - localHourDiff;
}

type EventProps = {
    onClick: () => void;
    firstTableHour: number;
    day: number;
    startHour: number;
    endHour: number;
    title: string;
    modifier?: "Music" | "Moroshka" | "Game" | "Free" | string;
};
function Event({
    onClick,
    firstTableHour,
    day,
    startHour,
    endHour,
    title,
    modifier,
}: EventProps) {
    const { data: userData } = clientAPI.getAuth.useQuery();
    const editable = isAdmin(userData?.privileges);

    return (
        <section
            onClick={onClick}
            className={clsx(
                `col-star1685864661000t-1 rounded-sm p-6 row-span-[${
                    endHour - startHour + 1
                }] xl:col-start-[${day + 1}] xl:row-start-[${
                    startHour - firstTableHour + 2
                }] xl:row-end-[${endHour - firstTableHour + 2}]`,
                {
                    "bg-sky-700": modifier === "Game",
                    "bg-fuchsia-700": modifier === "Music",
                    "bg-orange-700": modifier === "Moroshka",
                    "bg-green-700": modifier === "Free",
                    "cursor-pointer transition-all hover:scale-110": editable,
                },
            )}
        >
            <h2 className="flex h-full w-full items-center justify-between whitespace-pre-line xl:justify-center">
                <span className="mr-10 justify-self-start xl:hidden">
                    {days[day - 1]}
                    {`
                    `}
                    {startHour}:00 - {endHour}:00
                </span>
                <span className="max-w-[15ch] text-right xl:text-left">
                    {title}
                </span>
            </h2>
        </section>
    );
}

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const tableHeader = [
    "",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
] as const;

export function generateHourArray(startHour = 10, size = 13) {
    const hourArray: number[] = new Array(size);
    for (let i = 0; i < size; i++) {
        const hour = (startHour + i) % 24;
        hourArray[i] = hour < 0 ? 24 + hour : hour;
    }

    return hourArray;
}

function getWeekRange(weekDate = new Date()) {
    const weekStart = weekDate;
    let dayDiff = weekStart.getDay() - 1;
    if (dayDiff < 0) {
        dayDiff = 6;
    }
    weekStart.setDate(weekStart.getDate() - dayDiff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date();
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return [
        Date.parse(weekStart.toUTCString()),
        Date.parse(weekEnd.toUTCString()),
    ] as const;
}
