import clsx from "clsx";
import { popUpStyles } from "~/components/styles/popUp";
import { trianglePopUpStyles } from "~/components/styles/trianglePopUpStyles";
import { Dot } from "~/svg/Dot";
import { days } from "~/utils/schedule";
import { type EventModifier } from "~/utils/types/schedule";

type EventProps = {
    onClick: () => void;
    firstScheduleHour: number;
    day: number;
    startHour: number;
    endHour: number;
    title: string;
    description: string;
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
    description,
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
            data-before={description}
            onClick={onClick}
            className={clsx(
                popUpStyles,
                trianglePopUpStyles,
                `relative col-start-1 rounded-md p-6   
                xl:w-[15ch] xl:py-0 row-span-[${
                    endHour - startHour + 1
                }] xl:col-start-[${day + 1}] xl:row-start-[${
                    startHour - firstScheduleHour + 2
                }] xl:row-end-[${
                    endHour - firstScheduleHour + 2
                }] cursor-pointer  transition-colors duration-75 ease-in-out`,
                {
                    "bg-purple-800 hover:bg-purple-700": modifier === "Variety",
                    "bg-blue-800 hover:bg-blue-700": modifier === "VKPlay",
                    "bg-fuchsia-800 hover:bg-fuchsia-700": modifier === "Music",
                    "bg-pink-800 hover:bg-pink-700": modifier === "Moroshka",
                    "bg-gray-800 hover:bg-gray-700": modifier === "Free",
                    "before:hover:block after:hover:block": description !== "",
                },
            )}
        >
            {isActive && modifier !== "Free" && (
                <>
                    <Dot
                        size="1.5rem"
                        className="animate- absolute right-0 top-0 fill-sky-400 stroke-sky-400"
                    />
                    <Dot
                        size="1.5rem"
                        className="absolute right-0 top-0 animate-ping fill-sky-400 stroke-sky-400"
                    />
                </>
            )}

            <h2 className="flex h-full w-full items-center justify-between xl:justify-center">
                <span className="justify-self-start xl:hidden">
                    {days[day - 1]}
                    <br />
                    {startHour % 24}:00 <br className="sm:hidden" />
                    <span className="hidden sm:inline">-</span> {endHour % 24}
                    :00
                </span>
                <span className="max-w-[20ch] text-right xl:text-left">
                    {title}
                </span>
            </h2>
        </section>
    );
}
