import { useServerUser } from "~/rsc/useServerUser";

export const runtime = "edge";

export default async function Queue() {
    const user = await useServerUser();


    return <></>;
}

