"use client";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { isMod } from "~/utils/privileges";

export function QueueSocketsSub({ privileges }: { privileges?: number }) {
    const ctx = clientAPI.useContext();

    useEffect(() => {
        socketClient.on("invalidate", () => {
            ctx.queue.invalidate();
        });

        return () => {
            socketClient.off("invalidate");
        };
    }, [ctx.queue]);

    useEffect(() => {
        if (!isMod(privileges)) {
            return;
        }

        socketClient.on("success", (message) => {
            toast.success(message);
        });

        socketClient.on("error", (message) => {
            toast.error(message);
        });

        socketClient.on("info", (message) => {
            toast.success(message);
        });

        return () => {
            if (!isMod(privileges)) {
                return;
            }

            socketClient.off("error");
            socketClient.off("info");
            socketClient.off("success");
        };
    }, [privileges]);
    return <></>;
}
