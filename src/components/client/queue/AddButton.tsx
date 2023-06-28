"use client";

import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { buttonStyles } from "~/components/styles/button";

export function AddButton() {
    const { data: userData } = clientAPI.getAuth.useQuery();
    const { mutate: addSong } = clientAPI.queue.add.useMutation({
        onSuccess() {
            socketClient.emit("invalidate", { username: userData?.encUser });
        },
    });

    return (
        <button
            onClick={() => addSong({ artist: "", songName: "" })}
            className={buttonStyles}
        >
            Add blank song
        </button>
    );
}
