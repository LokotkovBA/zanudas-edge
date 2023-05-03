"use client";

import { clientAPI } from "~/client/ClientProvider";
import { type SonglistEntry } from "~/drizzle/types";
import { type ChangeEvent, useState } from "react";
import { searchBarStyles } from "~/components/styles/searchBar";
import { dehydrate, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import clsx from "clsx";

function filterStyles(isSelected: boolean) {
    const className = "border-b-2 px-5 py-1";
    return clsx(className, {
        "border-b-slate-700": !isSelected,
        "text-sky-400 border-b-sky-400": isSelected,
    });
}

const filterValues = ["Foreign", "Russian", "OST", "Original"];

export function SearchableSongList() {
    const queryClient = useQueryClient();
    dehydrate(queryClient);
    const { data: songlistData } = clientAPI.songlist.getAll.useQuery();

    const [searchValue, setSearchValue] = useState("");

    function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value);
    }

    const [filterState, setFilterState] = useState(-1);

    return (
        <>
            <header className="flex flex-col gap-2">
                <input
                    className={searchBarStyles}
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Search"
                    type="text"
                />
                <div className="grid grid-cols-4">
                    {filterValues.map((value, index) => (
                        <button
                            className={filterStyles(filterState === index)}
                            onClick={() =>
                                setFilterState((prevState) =>
                                    prevState === index ? -1 : index,
                                )
                            }
                            key={value}
                        >
                            {value}
                        </button>
                    ))}
                </div>
            </header>
            <ul className="w-full sm:w-2/3 xl:w-1/3">
                {splitByAuthor(
                    searchSonglist(
                        searchValue,
                        filterSonglist(filterState, filterValues, songlistData),
                    ),
                ).map((authorBlock) => {
                    return (
                        <li
                            className="mb-2 rounded border border-slate-500 bg-slate-950 p-3 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow hover:shadow-black"
                            key={authorBlock[0].id}
                        >
                            <h2 className="border-b border-b-sky-400 text-lg font-bold text-sky-400">
                                {authorBlock[0].artist}
                            </h2>
                            <div className="flex flex-col gap-2 py-2">
                                {authorBlock.map(({ id, artist, songName }) => (
                                    <p
                                        onClick={() =>
                                            copyToClipboard(
                                                `${artist} - ${songName}`,
                                            )
                                        }
                                        className="w-auto min-w-full cursor-pointer hover:text-sky-500"
                                        key={id}
                                    >
                                        {songName}
                                    </p>
                                ))}
                            </div>
                        </li>
                    );
                })}
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

function filterSonglist(
    filterState: number,
    filterValues: string[],
    songlist?: SonglistEntry[],
) {
    return songlist?.filter(({ tag }) => {
        return filterState === -1
            ? true
            : tag?.includes(filterValues[filterState].toLowerCase());
    });
}

function searchSonglist(search: string | null, songlist?: SonglistEntry[]) {
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
