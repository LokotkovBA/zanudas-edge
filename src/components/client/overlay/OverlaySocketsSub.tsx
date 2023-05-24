"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { socketClient } from "~/client/socketClient";

export function OverlaySocketsSub() {
    const router = useRouter();
    useEffect(() => {
        socketClient.on("invalidate", () => {
            router.refresh();
        });

        return () => {
            socketClient.off("invalidate");
        };
    }, [router]);

    return <></>;
}
