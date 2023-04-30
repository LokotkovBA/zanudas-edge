import { redirect } from "next/navigation";
import { api } from "~/server/api";
import { isAdmin } from "~/utils/privileges";

export const runtime = "edge";

export default async function Users() {
    const user = await api.whoami.fetch();
    if (!isAdmin(user?.privileges)) {
        redirect("/");
    }

    return <>Users</>;
}
