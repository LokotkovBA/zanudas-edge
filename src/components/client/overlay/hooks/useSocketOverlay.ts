import { useEffect, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { filterMaxDisplay } from "~/utils/overlay";
import type { OverlayQueueEntry } from "~/utils/types/overlay";

export function useSocketOverlay(maxDisplay: number) {
    const [oldCurrent, setOldCurrent] = useState(0);
    const [text, setText] = useState("");
    const [textVisible, setTextVisible] = useState(false);

    const { data: overlayData } = clientAPI.queue.getOverlay.useQuery();
    const ctx = clientAPI.useContext();

    const [overlayEntries, setOverlayEntries] = useState<OverlayQueueEntry[]>(
        filterMaxDisplay(maxDisplay, overlayData, oldCurrent),
    );

    useEffect(() => {
        setOverlayEntries(
            filterMaxDisplay(maxDisplay, overlayData, oldCurrent),
        );
    }, [overlayData, maxDisplay, oldCurrent]);

    useEffect(() => {
        socketClient.on("invalidate", () => {
            ctx.queue.getOverlay.invalidate();
        });

        return () => {
            socketClient.off("invalidate");
        };
    }, [ctx.queue.getOverlay]);

    useEffect(() => {
        socketClient.on("overlay text", (message: string) => {
            if (typeof message !== "string") {
                return;
            }

            setText(message);
        });

        socketClient.on("overlay text visibility", (message: string) => {
            if (typeof message !== "string") {
                return;
            }

            setTextVisible(message === "show");
        });

        socketClient.emit("sub admin");
        socketClient.emit("get overlay text");
        socketClient.emit("get overlay text visibility");
        socketClient.emit("get current");

        return () => {
            socketClient.emit("unsub admin");
            socketClient.off("overlay text");
            socketClient.off("overlay text visibility");
        };
    }, []);

    useEffect(() => {
        socketClient.on("current", (message: number) => {
            if (typeof message !== "number") {
                return;
            }

            setOldCurrent(message);
        });
        return () => {
            socketClient.off("current");
        };
    }, [overlayData]);

    return [
        overlayEntries,
        oldCurrent,
        overlayData?.length ?? 0,
        text,
        textVisible,
    ] as const;
}
