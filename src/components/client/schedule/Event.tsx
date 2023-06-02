import clsx from "clsx";
import { days } from "~/utils/schedule";
import { type EventModifier } from "~/utils/types/schedule";

type EventProps = {
    onClick: () => void;
    firstScheduleHour: number;
    day: number;
    startHour: number;
    endHour: number;
    title: string;
    modifier: EventModifier;
    currentHour: number;
    isToday: boolean;
};

export function Event({
    onClick,
    firstScheduleHour,
    day,
    startHour,
    endHour,
    title,
    modifier,
    currentHour,
    isToday,
}: EventProps) {
    if (startHour > endHour) {
        const range = endHour + 24 - startHour;
        endHour = startHour + range;
    }

    const isActive =
        isToday && startHour <= currentHour && currentHour < endHour;

    if (firstScheduleHour > startHour) {
        startHour += 24;
        endHour += 24;
    }

    return (
        <section
            onClick={onClick}
            className={clsx(
                `col-start-1 rounded-md border-4 p-6 xl:py-0 row-span-[${
                    endHour - startHour + 1
                }] xl:col-start-[${day + 1}] xl:row-start-[${
                    startHour - firstScheduleHour + 2
                }] xl:row-end-[${
                    endHour - firstScheduleHour + 2
                }] cursor-pointer transition-all hover:scale-110`,
                {
                    "bg-green-800": modifier === "Variety",
                    "bg-sky-800": modifier === "VKPlay",
                    "bg-fuchsia-800": modifier === "Music",
                    "bg-pink-800": modifier === "Moroshka",
                    "bg-gray-800": modifier === "Free",
                    "border-green-700": !isActive && modifier === "Variety",
                    "border-sky-700": !isActive && modifier === "VKPlay",
                    "border-fuchsia-700": !isActive && modifier === "Music",
                    "border-pink-700": !isActive && modifier === "Moroshka",
                    "border-gray-700": !isActive && modifier === "Free",
                    "border-amber-400": isActive,
                },
            )}
        >
            <h2 className="flex h-full w-full items-center justify-between whitespace-pre-line xl:justify-center">
                <span className="mr-10 justify-self-start xl:hidden">
                    {days[day - 1]}
                    {`
                    `}
                    {startHour % 24}:00 - {endHour % 24}:00
                </span>
                <span className="max-w-[15ch] text-right xl:text-left">
                    {title}
                </span>
            </h2>
        </section>
    );
}
