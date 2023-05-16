"use client";
import { useEffect, useState } from "react";
import { socketClient } from "~/client/socketClient";
import DonationAlertsIcon from "~/svg/DonationAlertsIcon";

export function DAControl({ encUser }: { encUser: string }) {
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        socketClient.emit("centrifuge status");

        socketClient.on("centrifuge started", () => {
            setIsRunning(true);
        });
        socketClient.on("centrifuge stopped", () => {
            setIsRunning(false);
        });
        () => {
            socketClient.off("centrifuge started");
            socketClient.off("centrifuge stopped");
        };
    }, []);

    return isRunning ? (
        <button
            className="flex items-center gap-1 rounded border-2 border-transparent bg-red-800 fill-white p-1 hover:border-red-300"
            onClick={() =>
                socketClient.emit("centrifuge stop", {
                    username: encUser,
                })
            }
        >
            Stop <DonationAlertsIcon size="1.5rem" />
        </button>
    ) : (
        <button
            className="flex items-center gap-1 rounded border-2 border-transparent bg-green-800 fill-white p-1 hover:border-green-300"
            onClick={() =>
                socketClient.emit("centrifuge start", {
                    username: encUser,
                })
            }
        >
            Listen to <DonationAlertsIcon size="1.5rem" />
        </button>
    );
}
