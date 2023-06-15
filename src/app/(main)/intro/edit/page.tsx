import { redirect } from "next/navigation";
import { Suspense } from "react";
import { HydrateClient } from "~/client/HydrateClient";
import { SearchableIntroList } from "~/components/client/intro/SearchableIntroList";
import { Spinner } from "~/components/utils/Spinner";
import { serverAPI } from "~/server/api";
import { isAdmin } from "~/utils/privileges";

export const runtime = "edge";

export const metadata = {
    title: "Intro edit",
};

export default async function Intro() {
    const user = await serverAPI.getAuth.fetch();
    if (!isAdmin(user?.privileges)) {
        redirect("/");
    }

    return (
        <Suspense fallback={<Spinner />}>
            <IntroList />
        </Suspense>
    );
}

async function IntroList() {
    await serverAPI.intro.getAll.fetch();
    const state = await serverAPI.dehydrate();

    return (
        <>
            <HydrateClient state={state}>
                <SearchableIntroList />
            </HydrateClient>
        </>
    );
}
