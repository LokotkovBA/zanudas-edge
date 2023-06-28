"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { socketClient } from "~/client/socketClient";

export function EmptyQueueReloader() {
    const { refresh } = useRouter();
    useEffect(() => {
        socketClient.on("invalidate", refresh);

        return () => {
            socketClient.off("invalidate");
        };
    }, [refresh]);

    return <></>;
}
