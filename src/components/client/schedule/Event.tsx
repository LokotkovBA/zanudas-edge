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
};

export function Event({
    onClick,
    firstScheduleHour,
    day,
    startHour,
    endHour,
    title,
    modifier,
}: EventProps) {
    // if (startHour < 0) {
    //     startHour += 24;
    // }
    // if (endHour < 0) {
    //     endHour += 24;
    // }

    if (startHour > endHour) {
        const range = endHour + 24 - startHour;
        endHour = startHour + range;
    }

    if (firstScheduleHour > startHour) {
        startHour += 24;
        endHour += 24;
    }

    return (
        <section
            onClick={onClick}
            className={clsx(
                `col-start-1 rounded-sm p-6 xl:py-0 row-span-[${
                    endHour - startHour + 1
                }] xl:col-start-[${day + 1}] xl:row-start-[${
                    startHour - firstScheduleHour + 2
                }] xl:row-end-[${
                    endHour - firstScheduleHour + 2
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
                    {startHour % 24}:00 - {endHour % 24}:00
                </span>
                <span className="max-w-[15ch] text-right xl:text-left">
                    {title}
                </span>
            </h2>
        </section>
    );
}
