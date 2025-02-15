import { HydrateClient } from "~/client/HydrateClient";
import { DynamicOverlay } from "~/components/client/overlay/DynamicOverlay";
import { serverAPI } from "~/server/api";

export const runtime = "edge";

export default async function Overlay({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const maxDisplay = parseMaxDisplay(searchParams.maxDisplay);
    await serverAPI.queue.getOverlay.fetch();
    const state = await serverAPI.dehydrate();

    return (
        <main className="text-2xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            <HydrateClient state={state}>
                <DynamicOverlay maxDisplay={maxDisplay} />
            </HydrateClient>
        </main>
    );
}

function parseMaxDisplay(input: string | string[] | undefined): number {
    if (typeof input !== "string") {
        return 5;
    }
    const output = parseInt(input);
    return isNaN(output) ? 5 : output;
}
