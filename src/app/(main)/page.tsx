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

export default async function Home() {
    const userData = await serverAPI.getAuth.fetch();

    return (
        <>
            {isAdmin(userData?.privileges) && <AddEventButton />}{" "}
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <InitialSchedule />
            </Suspense>
        </>
    );
}

async function InitialSchedule() {
    const [weekStartTimestamp, weekEndTimestamp] = getTimeRange();
    const eventEntries = await getEventEntries(
        weekStartTimestamp,
        weekEndTimestamp,
        drizzleClient,
    );

    return (
        <Schedule
            eventEntries={eventEntries}
            weekStartServer={weekStartTimestamp}
            weekEndServer={weekEndTimestamp}
        />
    );
}
