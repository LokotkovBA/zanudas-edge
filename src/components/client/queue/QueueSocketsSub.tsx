"use client";
import { useEffect } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";

export function QueueSocketsSub() {
    const ctx = clientAPI.useContext();

    useEffect(() => {
        socketClient.on("invalidate", () => {
            ctx.queue.invalidate();
        });

        return () => {
            socketClient.off("invalidate");
        };
    }, [ctx.queue]);
    return <></>;
}
