import { Suspense } from "react";
import { AddEventButton } from "~/components/client/schedule/AddEventButton";
import { Schedule } from "~/components/client/schedule/Schedule";
import { Links } from "~/components/server/Links";
import { Spinner } from "~/components/utils/Spinner";
import { drizzleClient } from "~/drizzle/db";
import { serverAPI } from "~/server/api";
import { getEventEntries } from "~/server/routers/events";
import { isAdmin } from "~/utils/privileges";
import { getTimeRange } from "~/utils/schedule";

export const runtime = "edge";

export const metadata = {
    title: "Zanuda's schedule",
};

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
