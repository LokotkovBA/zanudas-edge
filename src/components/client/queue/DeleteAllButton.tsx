"use client";
import { useEffect, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { LoaderIcon } from "~/svg/LoaderIcon";

export function DeleteAllButton() {
    const { data: userData } = clientAPI.getAuth.useQuery();
    const { mutate: deleteAll } = clientAPI.queue.deleteAll.useMutation({
        onSuccess() {
            socketClient.emit("invalidate", { username: userData?.encUser });
            setIsLoading(false);
        },
    });

    const [sure, setSure] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function onClick() {
        if (!sure) {
            setSure(true);
            return;
        }

        setIsLoading(true);
        setSure(false);
        deleteAll();
    }

    function resetSure(event: Event) {
        if (
            event.target instanceof HTMLButtonElement &&
            event.target.hasAttribute("data-delete-all")
        ) {
            return;
        }

        setSure(false);
    }

    useEffect(() => {
        document.addEventListener("click", resetSure);

        return () => {
            document.removeEventListener("click", resetSure);
        };
    }, []);

    return (
        <button
            data-delete-all
            disabled={isLoading}
            onClick={onClick}
            className="bg-red-900 border-2 border-transparent hover:border-red-600 disabled:bg-gray-600 disabled:hover:border-gray-600 p-1 rounded"
        >
            {isLoading ? (
                <LoaderIcon
                    size="1.5rem"
                    className="animate-spin fill-slate-50"
                />
            ) : sure ? (
                "SURE?"
            ) : (
                "Delete ALL"
            )}
        </button>
    );
}
