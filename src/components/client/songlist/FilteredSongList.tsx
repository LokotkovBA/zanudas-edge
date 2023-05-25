import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { type Song } from "~/drizzle/types";
import {
    filterByCategorySonglist,
    filterBySearch,
    splitByArtist,
} from "~/utils/songlist";
import { ArtistBlock } from "./ArtistBlock";
import { ModalDelete, ModalEdit } from "./SongListModals";
import { LetterButtons } from "./LetterButtons";
import { isAdmin } from "~/utils/privileges";

type FilteredListProps = {
    privileges: number;
    defferedSearchValue: string;
    selectedCategoryIndex: number;
};

export const FilteredList = memo(function FilteredList({
    defferedSearchValue,
    selectedCategoryIndex,
    privileges,
}: FilteredListProps) {
    const { data: songListData } = clientAPI.songlist.getAll.useQuery(
        undefined,
        {
            onSuccess(songList) {
                setArtistBlocks(
                    splitByArtist(
                        artistFirstLettersRef.current,
                        filterBySearch(
                            defferedSearchValue,
                            filterByCategorySonglist(
                                selectedCategoryIndex,
                                songList.categories,
                                songList.songList,
                            ),
                        ),
                    ),
                );
            },
        },
    );

    const modalEditRef = useRef<HTMLDialogElement>(null);
    const modalDeleteRef = useRef<HTMLDialogElement>(null);
    const [modalEditData, setModalData] = useState<Song | null>(null);
    const artistFirstLettersRef = useRef<string[]>(
        songListData?.artistFirstLetters ?? [],
    );
    const [showMobileFirstLetters, setShowMobileFirstLetters] = useState(false);

    const [artistBlocks, setArtistBlocks] = useState(
        splitByArtist(
            artistFirstLettersRef.current,
            filterBySearch(
                defferedSearchValue,
                filterByCategorySonglist(
                    selectedCategoryIndex,
                    songListData?.categories ?? [],
                    songListData?.songList,
                ),
            ),
        ),
    );

    useEffect(() => {
        setArtistBlocks(
            splitByArtist(
                artistFirstLettersRef.current,
                filterBySearch(
                    defferedSearchValue,
                    filterByCategorySonglist(
                        selectedCategoryIndex,
                        songListData?.categories ?? [],
                        songListData?.songList,
                    ),
                ),
            ),
        );
    }, [
        defferedSearchValue,
        selectedCategoryIndex,
        songListData?.songList,
        songListData?.categories,
    ]);

    if (!songListData) {
        return <>The list is empty</>;
    }

    return (
        <>
            <nav className="sticky top-0 z-10 flex w-full px-3 sm:w-2/3 xl:w-1/3">
                <aside className="flex flex-col">
                    <button
                        className="h-full border border-sky-800 bg-sky-800 px-2 hover:border-slate-50 sm:hidden"
                        onClick={() =>
                            setShowMobileFirstLetters((prev) => !prev)
                        }
                    >
                        {showMobileFirstLetters ? "Hide" : "Letters"}
                    </button>
                    <Link
                        className="flex h-full items-center justify-center border border-sky-800 bg-sky-800 px-1 hover:border-slate-50"
                        href="/songlist#top"
                    >
                        Top
                    </Link>
                </aside>
                {showMobileFirstLetters && (
                    <LetterButtons
                        className="flex sm:hidden"
                        letters={artistFirstLettersRef.current}
                    />
                )}
                <LetterButtons
                    className="hidden sm:flex"
                    letters={artistFirstLettersRef.current}
                />
            </nav>
            <ul className="w-full sm:w-2/3 xl:w-1/3">
                {artistBlocks.map((block) => (
                    <ArtistBlock
                        key={block[0]?.artist ?? "no"}
                        artist={block[0]?.artist ?? "no"}
                        setModalData={setModalData}
                        modalDeleteRef={modalDeleteRef}
                        modalEditRef={modalEditRef}
                        block={block}
                    />
                ))}
            </ul>
            {isAdmin(privileges) && (
                <>
                    <ModalDelete
                        modalRef={modalDeleteRef}
                        id={modalEditData?.id}
                        artist={modalEditData?.artist}
                        songName={modalEditData?.songName}
                    />
                    <ModalEdit modalRef={modalEditRef} song={modalEditData} />
                </>
            )}
        </>
    );
});
