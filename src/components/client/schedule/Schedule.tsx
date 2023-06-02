"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
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
    getRangeParams,
    switchWeek,
} from "~/utils/schedule";
import { Event } from "./Event";
import { useRouter } from "next/navigation";

type ScheduleProps = {
    weekStartTimestamp: number;
    eventEntries: EventEntry[];
    weekStartDate: Date;
    weekEndDate: Date;
};

export function Schedule({
    weekStartTimestamp,
    eventEntries,
    weekStartDate,
    weekEndDate,
}: ScheduleProps) {
    const [utcOffset, setUtcOffset] = useState(0);
    const [firstScheduleHour, setFirstScheduleHour] = useState(7);
    const [hourArray, setHourArray] = useState<number[]>(
        generateHourArray(7, 12),
    );

    useEffect(() => {
        const localFirstScheduleHour = fromZanudasToLocalHour(10);
        setFirstScheduleHour(localFirstScheduleHour);
        setHourArray(generateHourArray(localFirstScheduleHour, 12));
        setUtcOffset(Math.floor(new Date().getTimezoneOffset() / 60));
    }, []);

    const [eventEntry, setEventEntry] = useState<EventEntry>({
        id: -1,
        startDate: weekStartDate,
        endDate: weekEndDate,
        description: "",
        title: "",
        modifier: "Variety",
        weekDay: -1,
    });

    const modalChangeRef = useRef<HTMLDialogElement>(null);

    const { data: userData } = clientAPI.getAuth.useQuery();
    const editable = isAdmin(userData?.privileges);

    const router = useRouter();
    useEffect(() => {
        router.prefetch(getRangeParams(weekStartTimestamp, "Next"));
        router.prefetch(getRangeParams(weekStartTimestamp, "Prev"));
    }, [router, weekStartTimestamp]);

    return (
        <section className="flex flex-col items-center">
            <header className="flex items-center gap-2 rounded-t-xl bg-sky-950">
                <button
                    onClick={() =>
                        switchWeek(weekStartTimestamp, "Prev", router)
                    }
                    className="rounded-br-xl rounded-tl-xl hover:bg-sky-900"
                >
                    <ChevronLeft size="2rem" className="fill-slate-50" />
                </button>
                <h2>
                    {weekStartDate.toUTCString().slice(4, 16)} -{" "}
                    {weekEndDate.toUTCString().slice(4, 16)}
                </h2>
                <button
                    onClick={() =>
                        switchWeek(weekStartTimestamp, "Next", router)
                    }
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
                {eventEntries.map((event) => (
                    <Event
                        onClick={() => {
                            if (!editable) {
                                return;
                            }
                            modalChangeRef.current?.showModal();
                            setEventEntry(event);
                        }}
                        key={event.id}
                        firstScheduleHour={firstScheduleHour}
                        day={event.weekDay}
                        startHour={
                            (event.startDate.getUTCHours() - utcOffset) % 24
                        }
                        endHour={(event.endDate.getUTCHours() - utcOffset) % 24}
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
