"use client";

import { clientAPI } from "~/client/ClientProvider";
import { type SonglistEntry } from "~/drizzle/types";
import { type ChangeEvent, useState } from "react";
import { searchBarStyles } from "~/components/styles/searchBar";
import { dehydrate, useQueryClient } from "@tanstack/react-query";

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
                {filterSonglist(searchValue, songlistData)?.map((song) => (
                    <li key={song.id}>
                        {song.artist} - {song.songName}
                    </li>
                ))}
            </ul>
        </>
    );
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
