import { cookies } from "next/dist/client/components/headers";
import { createGetUser } from "~/auth/getUser";

export const getUser = createGetUser(cookies())
