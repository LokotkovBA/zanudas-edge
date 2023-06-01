"use client";

import clsx from "clsx";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { isAdmin } from "~/utils/privileges";
import { ModalChangeEvent } from "./ModalChangeEvent";
import type { EventEntry, EventModifier } from "~/utils/types/schedule";
import { ChevronLeft } from "~/svg/ChevronLeft";
import { ChevronRight } from "~/svg/ChevronRight";

export function WeekTable() {
    const [hourArray, setHourArray] = useState<number[]>([]);
    const selectedDateRef = useRef(new Date());
    const [eventEntry, setEventEntry] = useState<EventEntry>({
        id: -1,
        startDate: selectedDateRef.current,
        endDate: selectedDateRef.current,
        description: "",
        title: "",
        modifier: "Variety",
    });

    const firstTableHourRef = useRef(
        fromZanudasToLocalHour(10, selectedDateRef.current),
    );
    const modalChangeRef = useRef<HTMLDialogElement>(null);
    const [
        {
            timeRange: [weekStartTimestamp, weekEndTimestamp],
        },
        changeRange,
    ] = useReducer(weeekReducer, {
        currentDate: selectedDateRef.current,
        timeRange: getTimeRange(selectedDateRef.current),
    });

    const { data: eventsData } = clientAPI.events.getWeek.useQuery({
        weekStartTimestamp,
        weekEndTimestamp,
    });

    useEffect(() => {
        setHourArray(generateHourArray(firstTableHourRef.current, 12)); // HACK: this fixes the hydration error if the client's timezone is different from the server's
    }, []);

    const { data: userData } = clientAPI.getAuth.useQuery();
    const editable = isAdmin(userData?.privileges);

    return (
        <section className="flex flex-col items-center">
            <header className="flex items-center gap-2 rounded-t-xl bg-sky-950">
                <button
                    onClick={() => changeRange("Prev")}
                    className="rounded-br-xl rounded-tl-xl hover:bg-sky-900"
                >
                    <ChevronLeft size="2rem" className="fill-slate-50" />
                </button>
                <h2>
                    {new Date(weekStartTimestamp).toDateString().slice(4)} -{" "}
                    {new Date(weekEndTimestamp).toDateString().slice(4)}
                </h2>
                <button
                    onClick={() => changeRange("Next")}
                    className="rounded-bl-xl rounded-tr-xl hover:bg-sky-900"
                >
                    <ChevronRight size="2rem" className="fill-slate-50" />
                </button>
            </header>
            <section className="grid grid-cols-1 grid-rows-5 gap-2 xl:grid-cols-schedule xl:gap-x-4  xl:gap-y-0">
                {generateDays(weekStartTimestamp).map(
                    ({ dayWeek, dayNumber }, index) => {
                        return (
                            <h3
                                className={`row-start-1 hidden justify-center xl:col-auto xl:flex xl:items-center xl:col-start-[${
                                    index + 2
                                }]`}
                                key={dayWeek}
                            >
                                {dayWeek}, {dayNumber}
                            </h3>
                        );
                    },
                )}

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
                            if (!editable) {
                                return;
                            }
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
            {editable && (
                <ModalChangeEvent
                    event={eventEntry}
                    setEvent={setEventEntry}
                    modalChangeRef={modalChangeRef}
                />
            )}
        </section>
    );
}

function weeekReducer(
    {
        currentDate,
    }: { timeRange: readonly [number, number]; currentDate: Date },
    actionType: "Prev" | "Next",
) {
    const diff = actionType === "Prev" ? -7 : 7;
    currentDate.setDate(currentDate.getDate() + diff);

    const timeRange = getTimeRange(currentDate);

    return {
        currentDate,
        timeRange,
    };
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
    return (
        <section
            onClick={onClick}
            className={clsx(
                `col-start-1 rounded-sm p-6 xl:py-0 row-span-[${
                    endHour - startHour + 1
                }] xl:col-start-[${day + 1}] xl:row-start-[${
                    startHour - firstTableHour + 2
                }] xl:row-end-[${
                    endHour - firstTableHour + 2
                }] cursor-pointer transition-all hover:scale-110`,
                {
                    "border-4 border-green-700 bg-green-800":
                        modifier === "Variety",
                    "border-4 border-sky-700 bg-sky-800": modifier === "VKPlay",
                    "border-4 border-fuchsia-700 bg-fuchsia-800":
                        modifier === "Music",
                    "border-4 border-orange-700 bg-orange-800":
                        modifier === "Moroshka",
                    "border-4 border-gray-700 bg-gray-800": modifier === "Free",
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

function generateDays(weekStartTimestamp: number) {
    const startDate = new Date(weekStartTimestamp);
    const out: { dayNumber: number; dayWeek: string }[] = [];

    for (const day of days) {
        out.push({ dayNumber: startDate.getDate(), dayWeek: day });
        startDate.setDate(startDate.getDate() + 1);
    }

    return out;
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

function getTimeRange(weekStart = new Date()) {
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
