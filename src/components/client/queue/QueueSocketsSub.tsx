"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { socketClient } from "~/client/socketClient";
import { isMod } from "~/utils/privileges";

export function QueueSocketsSub({ privileges }: { privileges?: number }) {
    const router = useRouter();

    useEffect(() => {
        socketClient.on("invalidate", () => {
            router.refresh();
        });

        return () => {
            socketClient.off("invalidate");
        };
    }, [router]);

    useEffect(() => {
        if (!isMod(privileges)) {
            return;
        }

        socketClient.emit("sub admin");

        socketClient.on("success", (message) => {
            toast.success(message);
        });

        socketClient.on("error", (message) => {
            toast.error(message);
        });

        socketClient.on("info", (message) => {
            toast(message, {
                icon: "❕",
            });
        });

        return () => {
            if (!isMod(privileges)) {
                return;
            }

            socketClient.emit("unsub admin");
            socketClient.off("error");
            socketClient.off("info");
            socketClient.off("success");
        };
    }, [privileges]);
    return <></>;
}
