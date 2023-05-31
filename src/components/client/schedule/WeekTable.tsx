"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { isAdmin } from "~/utils/privileges";
import { ModalChangeEvent } from "./ModalChangeEvent";
import type { EventEntry, EventModifier } from "~/utils/types/schedule";

export function WeekTable() {
    const [hourArray, setHourArray] = useState<number[]>([]);
    const todayRef = useRef(new Date());
    const [eventEntry, setEventEntry] = useState<EventEntry>({
        id: -1,
        startDate: todayRef.current,
        endDate: todayRef.current,
        description: "",
        title: "",
        modifier: "Variety",
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
            <section className="grid grid-cols-1 grid-rows-5 gap-2 xl:grid-cols-schedule xl:gap-x-4  xl:gap-y-0">
                {days.map((header, index) => (
                    <h3
                        className={`row-start-1 hidden justify-center xl:col-auto xl:flex xl:items-center xl:col-start-[${
                            index + 2
                        }]`}
                        key={header}
                    >
                        {header}
                    </h3>
                ))}
                <div className="z-[-1] col-span-9 col-start-1 row-start-1 hidden rounded-t bg-sky-950 xl:block" />
                {hourArray.map((hour, index, array) => (
                    <React.Fragment key={index}>
                        <h3
                            className={`p-2 xl:row-start-[${
                                index + 2
                            }] col-start-1 hidden self-center justify-self-end xl:block`}
                        >
                            {hour}:00
                        </h3>
                        <div
                            className={clsx(
                                `z-[-1] col-span-9 col-start-1 hidden xl:block xl:row-start-[${
                                    index + 2
                                }]`,
                                {
                                    "bg-sky-950": index % 2 === 1,
                                    "bg-sky-900": index % 2 === 0,
                                    "rounded-b": index + 1 === array.length,
                                },
                            )}
                        />
                    </React.Fragment>
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
    modifier: EventModifier;
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
                `col-start-1 rounded-sm p-6 xl:py-0 row-span-[${
                    endHour - startHour + 1
                }] xl:col-start-[${day + 1}] xl:row-start-[${
                    startHour - firstTableHour + 2
                }] xl:row-end-[${endHour - firstTableHour + 2}]`,
                {
                    "border-4 border-green-700 bg-green-800":
                        modifier === "Variety",
                    "border-4 border-sky-700 bg-sky-800": modifier === "VKPlay",
                    "border-4 border-fuchsia-700 bg-fuchsia-800":
                        modifier === "Music",
                    "border-4 border-orange-700 bg-orange-800":
                        modifier === "Moroshka",
                    "border-4 border-gray-700 bg-gray-800": modifier === "Free",
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
