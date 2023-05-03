"use client";

import { clientAPI } from "~/client/ClientProvider";
import { type SonglistEntry } from "~/drizzle/types";
import { type ChangeEvent, useState } from "react";
import { searchBarStyles } from "~/components/styles/searchBar";
import { dehydrate, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export function SearchableSongList() {
    const queryClient = useQueryClient();
    dehydrate(queryClient);
    const { data: songlistData } = clientAPI.songlist.getAll.useQuery();

    const [searchValue, setSearchValue] = useState("");

    function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value);
    }

    return (
        <>
            <input
                className={searchBarStyles}
                value={searchValue}
                onChange={onSearchChange}
                placeholder="Search"
                type="text"
            />
            <ul>
                {splitByAuthor(filterSonglist(searchValue, songlistData)).map(
                    (authorBlock) => {
                        return (
                            <li
                                className="mb-2 rounded border border-slate-500 bg-slate-950 p-3"
                                key={authorBlock[0].id}
                            >
                                <h2 className="border-b border-b-sky-400 text-lg font-bold text-sky-400">
                                    {authorBlock[0].artist}
                                </h2>
                                <div className="flex flex-col gap-2 py-2">
                                    {authorBlock.map((song) => (
                                        <p
                                            onClick={() =>
                                                copyToClipboard(
                                                    `${song.artist} - ${song.songName}`,
                                                )
                                            }
                                            className="cursor-pointer hover:text-sky-500"
                                            key={song.id}
                                        >
                                            {song.songName}
                                        </p>
                                    ))}
                                </div>
                            </li>
                        );
                    },
                )}
            </ul>
        </>
    );
}

function copyToClipboard(text: string) {
    toast.success("Copied");
    navigator.clipboard.writeText(text);
}

function splitByAuthor(list?: SonglistEntry[]): SonglistEntry[][] {
    const result: SonglistEntry[][] = [];
    if (list === undefined || list.length === 0) return result;

    let curArtist = list[0].artist;
    let curArtistArray: SonglistEntry[] = [];
    for (const song of list) {
        if (song.artist !== curArtist) {
            result.push(curArtistArray);
            curArtistArray = [];
            curArtist = song.artist;
        }
        curArtistArray.push(song);
    }
    result.push(curArtistArray);

    return result;
}

function filterSonglist(search: string | null, songlist?: SonglistEntry[]) {
    return songlist?.filter(({ artist, songName, tag }) => {
        if (!search) return true;
        const lowerSearch = search.toLowerCase();
        const lowerArtist = artist.toLowerCase();
        const lowerSongName = songName.toLowerCase();

        return (
            lowerSearch === "" ||
            lowerArtist.includes(lowerSearch) ||
            lowerSongName.includes(lowerSearch) ||
            tag?.includes(lowerSearch) ||
            `${lowerArtist} - ${lowerSongName}`.includes(lowerSearch) ||
            `${lowerArtist} ${lowerSongName}`.includes(lowerSearch)
        );
    });
}
