"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { clientAPI } from "~/client/ClientProvider";
import { insertSongsSchema } from "~/drizzle/schemas/songlist";
import { buttonStyles } from "~/components/styles/button";
import toast from "react-hot-toast";
import { Spinner } from "~/components/utils/Spinner";
import { type Song } from "~/drizzle/types";

export function FileUploader() {
    const onDrop: <T extends File>(acceptedFiles: T[]) => void = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles.length > 1) {
                acceptedFiles.length = 0;
                return toast.error("File limit is 1");
            }
            const fileReader = new FileReader();
            const currentFile = acceptedFiles.pop();
            if (!currentFile) {
                return toast.error("File error");
            }
            fileReader.readAsText(currentFile, "UTF-8");
            fileReader.onload = (event) => {
                if (
                    !event.target?.result ||
                    typeof event.target.result !== "string"
                ) {
                    return;
                }
                const uploadedJSON = JSON.parse(event.target.result);
                const oldSchema = z
                    .array(oldSonglistSchema)
                    .safeParse(uploadedJSON);
                if (oldSchema.success) {
                    const newList = parseOldList(oldSchema.data);
                    deleteId(newList);
                    setSonglistForUpload(newList);
                    return;
                }

                const newSchema = z
                    .array(insertSongsSchema)
                    .safeParse(uploadedJSON);
                if (newSchema.success) {
                    deleteId(newSchema.data);
                    setSonglistForUpload(newSchema.data);
                    return;
                }

                toast.error("Unknown data format");
            };
        },
        [],
    );
    const [songlistForUpload, setSonglistForUpload] = useState<Song[]>([]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    const { mutate: uploadMany, isLoading } =
        clientAPI.songlist.uploadMany.useMutation({
            onSuccess() {
                toast.success("Upload success");
                setSonglistForUpload([]);
            },
            onError(error) {
                toast.error(error.message);
            },
        });

    return (
        <>
            {isLoading && <Spinner />}
            {songlistForUpload.length === 0 && (
                <div
                    className="box-content flex h-[5ch] w-[16ch] cursor-pointer items-center justify-center bg-slate-950 p-5"
                    {...getRootProps()}
                >
                    <input {...getInputProps()} />
                    {isDragActive && <p>Drop the files here ...</p>}
                    {!isDragActive && (
                        <p>Drag and drop or click to select files</p>
                    )}
                </div>
            )}
            {songlistForUpload.length > 0 && !isLoading && (
                <button
                    disabled={isLoading}
                    className={buttonStyles}
                    onClick={() => uploadMany(songlistForUpload)}
                >
                    Upload JSON
                </button>
            )}
        </>
    );
}

function deleteId(list: Song[]) {
    for (const song of list) {
        if (song.id !== undefined) {
            delete song.id;
        }
    }
}

function parseOldList(list: z.infer<typeof oldSonglistSchema>[]) {
    const result: Song[] = [];

    for (const oldSong of list) {
        result.push({
            ...oldSong,
            songName: oldSong.song_name,
            likeCount: oldSong.likes,
            playCount: oldSong.count,
            lastPlayed: oldSong.date,
        });
    }
    return result;
}

const oldSonglistSchema = z.object({
    id: z.number(),
    artist: z.string(),
    count: z.number(),
    date: z.string().nullable(),
    likes: z.number(),
    song_name: z.string(),
    tag: z.string(),
});
