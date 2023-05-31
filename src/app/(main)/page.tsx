import { AddEventButton } from "~/components/client/schedule/AddEventButton";
import { WeekTable } from "~/components/client/schedule/WeekTable";
import { serverAPI } from "~/server/api";
import { isAdmin } from "~/utils/privileges";

export const runtime = "edge";

export default async function Home() {
    const userData = await serverAPI.getAuth.fetch();
    return (
        <>
            {isAdmin(userData?.privileges) && <AddEventButton />}
            <WeekTable />
        </>
    );
}
