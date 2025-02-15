"use client";

import { clientAPI } from "~/client/ClientProvider";
import React, {
    type ChangeEvent,
    useState,
    useRef,
    useDeferredValue,
} from "react";
import { searchBarStyles } from "~/components/styles/searchBar";
import clsx from "clsx";
import { isAdmin } from "~/utils/privileges";
import { buttonStyles } from "~/components/styles/button";
import { exportJSON } from "~/utils/songlist";
import { ModalAdd } from "./SongListModals";
import { FilteredSongList } from "./FilteredSongList";
import type { SongListType } from "~/utils/types";
import { Spinner } from "~/components/utils/Spinner";

function categoryStyles(isSelected: boolean) {
    const className =
        "border-b-2 px-5 py-1 grid grid-cols-1 justify-items-center md:grid-cols-2";
    return clsx(className, {
        "border-b-slate-700": !isSelected,
        "text-sky-400 border-b-sky-400": isSelected,
    });
}

export function SearchableSongList({
    privileges,
    type,
}: {
    privileges: number;
    type: SongListType;
}) {
    const { data: songListData } = clientAPI.songlist.getList.useQuery(type);

    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
    const modalAddRef = useRef<HTMLDialogElement>(null);

    const [searchValue, setSearchValue] = useState("");
    const defferedSearchValue = useDeferredValue(searchValue);
    function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value);
    }

    if (!songListData) {
        return <Spinner />;
    }

    if (!songListData.songList.length) {
        return <>The list is empty</>;
    }

    const { categories, categoriesCounts } = songListData;

    return (
        <>
            <header className="mt-2 flex flex-col gap-2 p-2">
                <input
                    name="songList-search"
                    className={searchBarStyles}
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Search"
                    type="text"
                />
                {isAdmin(privileges) && (
                    <>
                        <button
                            className={buttonStyles}
                            onClick={() => modalAddRef.current?.showModal()}
                        >
                            Add song
                        </button>
                        <button
                            className={buttonStyles}
                            onClick={() => exportJSON(songListData.songList)}
                        >
                            Export all
                        </button>
                    </>
                )}
                <div className="grid grid-cols-4">
                    {categories.map((value, index) => (
                        <button
                            className={categoryStyles(
                                selectedCategoryIndex === index,
                            )}
                            onClick={() =>
                                setSelectedCategoryIndex((prevCategory) =>
                                    prevCategory === index ? -1 : index,
                                )
                            }
                            key={value}
                        >
                            {value}
                            <span className="box-content inline-block w-[3ch] rounded-md bg-sky-800 px-1 text-slate-50 md:ml-2">
                                {categoriesCounts[index]}
                            </span>
                        </button>
                    ))}
                </div>
            </header>
            <FilteredSongList
                defferedSearchValue={defferedSearchValue}
                selectedCategoryIndex={selectedCategoryIndex}
                privileges={privileges}
                type={type}
            />
            {isAdmin(privileges) && (
                <ModalAdd type={type} modalRef={modalAddRef} />
            )}
        </>
    );
}
