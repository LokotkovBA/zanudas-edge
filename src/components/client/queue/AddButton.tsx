"use client";

import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";

export function AddButton() {
    const { mutate: addSong } = clientAPI.queue.add.useMutation();

    return (
        <button
            onClick={() => addSong({ artist: "", songName: "" })}
            className={buttonStyles}
        >
            Add blank song
        </button>
    );
}
