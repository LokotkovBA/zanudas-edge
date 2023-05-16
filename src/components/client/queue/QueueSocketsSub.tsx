"use client";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";

export function QueueSocketsSub() {
    const ctx = clientAPI.useContext();

    useEffect(() => {
        socketClient.on("invalidate", () => {
            ctx.queue.invalidate();
        });

        socketClient.on("error", (message) => {
            toast.error(message);
        });

        return () => {
            socketClient.off("invalidate");
            socketClient.off("error");
        };
    }, [ctx.queue]);
    return <></>;
}
