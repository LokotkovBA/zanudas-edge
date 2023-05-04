"use client";

import { clientAPI } from "~/client/ClientProvider";
import { type SonglistEntry } from "~/drizzle/types";
import { type ChangeEvent, useState, useRef } from "react";
import { searchBarStyles } from "~/components/styles/searchBar";
import { dehydrate, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import Link from "next/link";
import { ThumbsUp } from "~/svg/ThumbsUp";

function categoryStyles(isSelected: boolean) {
    const className = "border-b-2 px-5 py-1 grid grid-cols-1 md:grid-cols-2";
    return clsx(className, {
        "border-b-slate-700": !isSelected,
        "text-sky-400 border-b-sky-400": isSelected,
    });
}

export function SearchableSongList() {
    const queryClient = useQueryClient();
    dehydrate(queryClient);

    const { data: songListData } = clientAPI.songlist.getAll.useQuery();

    const [searchValue, setSearchValue] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(-1);
    const artistFirstLetters = useRef<string[]>(
        songListData?.artistFirstLetters ?? [],
    );

    const [showMobileFirstLetters, setShowMobileFirstLetters] = useState(false);

    if (!songListData) {
        return <></>;
    }

    const { songList, categories, categoriesCounts } = songListData;

    function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value);
    }

    return (
        <>
            <header className="mt-2 flex flex-col gap-2 p-2">
                <input
                    className={searchBarStyles}
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Search"
                    type="text"
                />
                <div className="grid grid-cols-4">
                    {categories.map((value, index) => (
                        <button
                            className={categoryStyles(
                                selectedCategory === index,
                            )}
                            onClick={() =>
                                setSelectedCategory((prevCategory) =>
                                    prevCategory === index ? -1 : index,
                                )
                            }
                            key={value}
                        >
                            {value}
                            <span className="ml-2 box-content inline-block w-[3ch] rounded-md bg-sky-700 px-1 text-slate-50">
                                {categoriesCounts[index]}
                            </span>
                        </button>
                    ))}
                </div>
            </header>
            <nav className="sticky top-0 z-10 flex w-full px-3 sm:w-2/3 xl:w-1/3">
                <aside className="flex flex-col">
                    <button
                        className="h-full border border-sky-700 bg-sky-700 px-2 hover:border-slate-50 sm:hidden"
                        onClick={() =>
                            setShowMobileFirstLetters((prev) => !prev)
                        }
                    >
                        {showMobileFirstLetters ? "Hide" : "Letters"}
                    </button>
                    <button
                        className="h-full border border-sky-700 bg-sky-700 px-1 hover:border-slate-50"
                        onClick={() => scrollToTop()}
                    >
                        Top
                    </button>
                </aside>
                {showMobileFirstLetters && (
                    <LetterButtons
                        className="flex sm:hidden"
                        letters={artistFirstLetters.current}
                    />
                )}
                <LetterButtons
                    className="hidden sm:flex"
                    letters={artistFirstLetters.current}
                />
            </nav>
            <ul className="w-full sm:w-2/3 xl:w-1/3">
                {splitByAuthor(
                    artistFirstLetters.current,
                    filterBySearch(
                        searchValue,
                        filterByCategorySonglist(
                            selectedCategory,
                            categories,
                            songList,
                        ),
                    ),
                ).map((authorBlock) => {
                    return (
                        <li
                            className="z-0 mb-2 rounded border border-slate-500 bg-slate-950 p-3 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow hover:shadow-black"
                            key={authorBlock[0].id}
                            id={authorBlock[0].artist[0]}
                        >
                            <h2 className="border-b border-b-sky-400 text-lg font-bold text-sky-400">
                                {authorBlock[0].artist}
                            </h2>
                            <div className="flex flex-col gap-2 py-2">
                                {authorBlock.map(
                                    ({
                                        id,
                                        artist,
                                        songName,
                                        likeCount,
                                        playCount,
                                    }) => (
                                        <div
                                            key={id}
                                            onClick={() =>
                                                copyToClipboard(
                                                    `${artist} - ${songName}`,
                                                )
                                            }
                                            className="flex cursor-pointer items-end justify-between hover:text-sky-500"
                                        >
                                            <p className="pt-2 leading-none">
                                                {songName}
                                            </p>
                                            <section className="flex items-end gap-1 leading-none">
                                                {!!likeCount && (
                                                    <>
                                                        <span className="text-end">
                                                            {likeCount}
                                                        </span>
                                                        {likeCount > 0 && (
                                                            <ThumbsUp
                                                                size={"1.5rem"}
                                                                className="fill-green-400"
                                                            />
                                                        )}
                                                        {likeCount < 0 && (
                                                            <ThumbsUp
                                                                size={"1.5rem"}
                                                                className="fill-red-400"
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                {!!playCount &&
                                                    playCount > 1 && (
                                                        <p className="ml-1 whitespace-nowrap">
                                                            x{playCount}🎹
                                                        </p>
                                                    )}
                                            </section>
                                        </div>
                                    ),
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

function LetterButtons({
    letters,
    className,
}: {
    letters: string[];
    className: string;
}) {
    return (
        <menu className={clsx("flex-wrap", className)}>
            {letters.map((firstLetter) => {
                return (
                    <li key={firstLetter}>
                        <Link
                            className="flex w-6 justify-center border border-sky-700 bg-sky-700 px-1 hover:border-slate-50"
                            scroll={false}
                            href={`/songlist#${firstLetter}`}
                        >
                            {firstLetter}
                        </Link>
                    </li>
                );
            })}
        </menu>
    );
}

function scrollToTop() {
    if (typeof window === "undefined") return;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function copyToClipboard(text: string) {
    toast.success("Copied");
    navigator.clipboard.writeText(text);
}

function splitByAuthor(
    artistFirstLetters: string[],
    list?: SonglistEntry[],
): SonglistEntry[][] {
    artistFirstLetters.length = 0;
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

    artistFirstLetters.push(result[0][0].artist[0]);
    let letterIndex = 0;
    for (const block of result) {
        const curArtistFirstLetter = block[0].artist[0];
        if (artistFirstLetters[letterIndex] !== curArtistFirstLetter) {
            artistFirstLetters?.push(curArtistFirstLetter);
            letterIndex++;
        }
    }

    return result;
}

function filterByCategorySonglist(
    selectedCategory: number,
    categories: string[],
    songList?: SonglistEntry[],
) {
    return songList?.filter(({ tag }) => {
        return selectedCategory === -1
            ? true
            : tag?.includes(categories[selectedCategory].toLowerCase());
    });
}

function filterBySearch(search: string | null, songlist?: SonglistEntry[]) {
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
