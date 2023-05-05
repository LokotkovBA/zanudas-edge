import { Suspense } from "react";
import { HydrateClient } from "~/client/HydrateClient";
import { FileUploader } from "~/components/client/songlist/FileUploader";
import { SearchableSongList } from "~/components/client/songlist/SearchableSongList";
import { Spinner } from "~/components/utils/Spinner";
import { serverAPI } from "~/server/api";
import { isAdmin } from "~/utils/privileges";

export const runtime = "edge";

export default async function SongList() {
    const userData = await serverAPI.getAuth.fetch();

    return (
        <main className="flex flex-col items-center gap-2 px-5 sm:px-20">
            {isAdmin(userData?.privileges) && <FileUploader />}
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <List privileges={userData?.privileges} />
            </Suspense>
        </main>
    );
}

async function List({ privileges = 0 }: { privileges?: number }) {
    await serverAPI.songlist.getAll.fetch();
    const dehydratatedState = await serverAPI.dehydrate();

    return (
        <HydrateClient state={dehydratatedState}>
            <SearchableSongList privileges={privileges} />
        </HydrateClient>
    );
}
