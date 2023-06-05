import Link from "next/link";
import { Suspense } from "react";
import { AddEventButton } from "~/components/client/schedule/AddEventButton";
import { Schedule } from "~/components/client/schedule/Schedule";
import { Spinner } from "~/components/utils/Spinner";
import { drizzleClient } from "~/drizzle/db";
import { serverAPI } from "~/server/api";
import { getEventEntries } from "~/server/routers/events";
import { BoostyLogo } from "~/svg/BoostyLogo";
import { GoodGameLogo } from "~/svg/GoodGameLogo";
import { InstagramIcon } from "~/svg/InstagramIcon";
import { TelegramIcon } from "~/svg/TelegramIcon";
import { TwitchColorIcon } from "~/svg/TwitchColorIcon";
import { VKIcon } from "~/svg/VKIcon";
import { VKPlayIcon } from "~/svg/VKPlayIcon";
import { YoutubeIcon } from "~/svg/YoutubeIcon";
import { isAdmin } from "~/utils/privileges";
import { getTimeRange } from "~/utils/schedule";

export const runtime = "edge";

export default async function Home({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const userData = await serverAPI.getAuth.fetch();

    const [weekStartDate, weekEndDate, weekStartTimestamp, weekEndTimestamp] =
        parseWeekRange(searchParams.weekRange);

    return (
        <>
            {isAdmin(userData?.privileges) && <AddEventButton />}{" "}
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <InitialSchedule
                    weekStartTimestamp={weekStartTimestamp}
                    weekEndTimestamp={weekEndTimestamp}
                    weekStartDate={weekStartDate}
                    weekEndDate={weekEndDate}
                />
                <Links />
            </Suspense>
        </>
    );
}

function Links() {
    return (
        <aside
            className={`z-10 h-fit w-full border-t border-slate-500 bg-slate-950 p-2 xl:absolute xl:bottom-0
        2xl:absolute 2xl:right-0 2xl:top-1/2 2xl:w-fit 2xl:-translate-y-1/2 2xl:rounded-none 2xl:rounded-l 2xl:border-b 2xl:border-l 2xl:border-r-0`}
        >
            <ul className="flex flex-col gap-1 sm:grid sm:grid-cols-4 2xl:flex 2xl:flex-col">
                {linksArray.map(({ icon, link, title }) => (
                    <li key={link}>
                        <Link
                            className="box-content flex h-10 items-center gap-2 rounded p-2 hover:bg-slate-900"
                            target="_blank"
                            href={link}
                        >
                            {icon}
                            <h3>{title}</h3>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

const linksArray = [
    {
        icon: <TwitchColorIcon size="2rem" />,
        title: "Twitch",
        link: "https://www.twitch.tv/zanuda",
    },
    {
        icon: <VKPlayIcon size="2rem" />,
        title: "VKPlay",
        link: "https://vkplay.live/zanuda",
    },
    {
        icon: <TelegramIcon size="2rem" />,
        title: "Telegram",
        link: "https://t.me/etzalert",
    },
    {
        icon: (
            <BoostyLogo className="mr-[.35rem]" height="2rem" width="1.65rem" />
        ),
        title: "Boosty",
        link: "https://boosty.to/zanuda",
    },
    {
        icon: <InstagramIcon size="2rem" />,
        title: "Instagram",
        link: "https://www.instagram.com/zanudas",
    },
    {
        icon: <YoutubeIcon size="2rem" />,
        title: "Scrapnuda",
        link: "https://www.youtube.com/@Scrapnuda",
    },
    {
        icon: <GoodGameLogo width="2rem" height=".88rem" />,
        title: "GoodGame",
        link: "https://goodgame.ru/channel/morethanthree",
    },
    {
        icon: <VKIcon size="2rem" />,
        title: "VK",
        link: "https://vk.com/morethanthree",
    },
];

type InitialScheduleProps = {
    weekStartTimestamp: number;
    weekEndTimestamp: number;
    weekStartDate: Date;
    weekEndDate: Date;
};

async function InitialSchedule({
    weekStartTimestamp,
    weekEndTimestamp,
    weekStartDate,
    weekEndDate,
}: InitialScheduleProps) {
    const eventEntries = await getEventEntries(
        weekStartTimestamp,
        weekEndTimestamp,
        drizzleClient,
    );

    return (
        <Schedule
            eventEntries={eventEntries}
            weekStartTimestamp={weekStartTimestamp}
            weekEndTimestamp={weekEndTimestamp}
            weekStartDate={weekStartDate}
            weekEndDate={weekEndDate}
        />
    );
}

function parseWeekRange(input: string | string[] | undefined) {
    if (typeof input !== "string") {
        return getTimeRange();
    }
    const [weekStartTimestamp, weekEndTimestamp] = input
        .split("-")
        .map((elem) => parseInt(elem));
    return weekStartTimestamp && weekEndTimestamp
        ? ([
              new Date(weekStartTimestamp),
              new Date(weekEndTimestamp),
              weekStartTimestamp,
              weekEndTimestamp,
          ] as const)
        : getTimeRange();
}
