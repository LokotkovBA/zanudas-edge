import { cookies } from "next/dist/client/components/headers";
import { createGetUser } from "~/auth/getUser";

export async function useServerGetUser() {
    return createGetUser(cookies())
}

