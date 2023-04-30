import { cookies } from "next/dist/client/components/headers";
import { createGetUser } from "~/auth/getUser";

export async function useServerUser() {
    return createGetUser(cookies())();
}
