"use client";

import clsx from "clsx";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { isAdmin } from "~/utils/privileges";
import { ModalChangeEvent } from "./ModalChangeEvent";
import type { EventEntry } from "~/utils/types/schedule";
import { ChevronLeft } from "~/svg/ChevronLeft";
import { ChevronRight } from "~/svg/ChevronRight";
import {
    fromZanudasToLocalHour,
    generateDays,
    generateHourArray,
    getDay,
    getTimeRange,
    weeekReducer,
} from "~/utils/schedule";
import { Event } from "./Event";

type ScheduleProps = {
    weekStartUTC: number;
    weekEndUTC: number;
    eventEntries: EventEntry[];
};

export function Schedule({
    weekStartUTC,
    weekEndUTC,
    eventEntries,
}: ScheduleProps) {
    const selectedDateRef = useRef(new Date(weekStartUTC));

    const [firstScheduleHour, setFirstScheduleHour] = useState(
        fromZanudasToLocalHour(10, selectedDateRef.current),
    );
    const [hourArray, setHourArray] = useState<number[]>(
        generateHourArray(firstScheduleHour, 12),
    );

    const [localEventEntries, setLocalEventEntries] = useState(eventEntries);

    const [eventEntry, setEventEntry] = useState<EventEntry>({
        id: -1,
        startDate: selectedDateRef.current,
        endDate: selectedDateRef.current,
        description: "",
        title: "",
        modifier: "Variety",
    });

    const modalChangeRef = useRef<HTMLDialogElement>(null);
    const [
        {
            timeRange: [weekStartTimestamp, weekEndTimestamp],
        },
        changeRange,
    ] = useReducer(weeekReducer, {
        currentDate: selectedDateRef.current,
        timeRange: [weekStartUTC, weekEndUTC],
    });

    clientAPI.events.getWeek.useQuery(
        {
            weekStartTimestamp,
            weekEndTimestamp,
        },
        {
            onSuccess(events) {
                setLocalEventEntries(events);
            },
        },
    );

    useEffect(() => {
        selectedDateRef.current = new Date();
        const weekRange = getTimeRange(selectedDateRef.current);

        changeRange({
            type: "NewRange",
            payload: weekRange,
        });

        const localFirstHour = fromZanudasToLocalHour(
            10,
            selectedDateRef.current,
        );

        setFirstScheduleHour(localFirstHour);
        setHourArray(generateHourArray(localFirstHour, 12));
    }, []);

    const { data: userData } = clientAPI.getAuth.useQuery();
    const editable = isAdmin(userData?.privileges);

    return (
        <section className="flex flex-col items-center">
            <header className="flex items-center gap-2 rounded-t-xl bg-sky-950">
                <button
                    onClick={() => changeRange({ type: "Prev" })}
                    className="rounded-br-xl rounded-tl-xl hover:bg-sky-900"
                >
                    <ChevronLeft size="2rem" className="fill-slate-50" />
                </button>
                <h2>
                    {new Date(weekStartTimestamp).toDateString().slice(4)} -{" "}
                    {new Date(weekEndTimestamp).toDateString().slice(4)}
                </h2>
                <button
                    onClick={() => changeRange({ type: "Next" })}
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
                {localEventEntries.map((event) => (
                    <Event
                        onClick={() => {
                            if (!editable) {
                                return;
                            }
                            modalChangeRef.current?.showModal();
                            setEventEntry(event);
                        }}
                        key={event.id}
                        firstTableHour={firstScheduleHour}
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
