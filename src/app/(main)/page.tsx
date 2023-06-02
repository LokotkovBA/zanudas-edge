import { Suspense } from "react";
import { AddEventButton } from "~/components/client/schedule/AddEventButton";
import { Schedule } from "~/components/client/schedule/Schedule";
import { Spinner } from "~/components/utils/Spinner";
import { drizzleClient } from "~/drizzle/db";
import { serverAPI } from "~/server/api";
import { getEventEntries } from "~/server/routers/events";
import { isAdmin } from "~/utils/privileges";
import { getTimeRange } from "~/utils/schedule";

export const runtime = "edge";

export default async function Home({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const userData = await serverAPI.getAuth.fetch();

    const [weekStartTimestamp, weekEndTimestamp] = parseWeekRange(
        searchParams.weekRange,
    );
    console.log(weekStartTimestamp, weekEndTimestamp);
    return (
        <>
            {isAdmin(userData?.privileges) && <AddEventButton />}{" "}
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <InitialSchedule
                    weekStartTimestamp={weekStartTimestamp}
                    weekEndTimestamp={weekEndTimestamp}
                />
            </Suspense>
        </>
    );
}

type InitialScheduleProps = {
    weekStartTimestamp: number;
    weekEndTimestamp: number;
};

async function InitialSchedule({
    weekStartTimestamp,
    weekEndTimestamp,
}: InitialScheduleProps) {
    const eventEntries = await getEventEntries(
        weekStartTimestamp,
        weekEndTimestamp,
        drizzleClient,
    );

    const weekStartDate = new Date(weekStartTimestamp);
    const weekEndDate = new Date(weekEndTimestamp);

    return (
        <Schedule
            eventEntries={eventEntries}
            weekStartTimestamp={weekStartTimestamp}
            weekStartDate={weekStartDate}
            weekEndDate={weekEndDate}
        />
    );
}

function parseWeekRange(input: string | string[] | undefined) {
    if (typeof input !== "string") {
        console.log(input);
        return getTimeRange();
    }
    const output = input.split("-").map((elem) => parseInt(elem));
    return output.length === 2 ? output : getTimeRange();
}
