"use client";

import { clientAPI } from "~/client/ClientProvider";
import { type Song } from "~/drizzle/types";
import React, {
    type ChangeEvent,
    useState,
    useRef,
    useEffect,
    useDeferredValue,
    memo,
} from "react";
import { searchBarStyles } from "~/components/styles/searchBar";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import Link from "next/link";
import { isAdmin } from "~/utils/privileges";
import { buttonStyles } from "~/components/styles/button";
import { inputStyles } from "~/components/styles/input";
import { ArtistBlock } from "./ArtistBlock";

function categoryStyles(isSelected: boolean) {
    const className =
        "border-b-2 px-5 py-1 grid grid-cols-1 justify-items-center md:grid-cols-2";
    return clsx(className, {
        "border-b-slate-700": !isSelected,
        "text-sky-400 border-b-sky-400": isSelected,
    });
}

export function SearchableSongList({ privileges }: { privileges: number }) {
    const { data: songListData } = clientAPI.songlist.getAll.useQuery();

    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
    const modalAddRef = useRef<HTMLDialogElement>(null);

    const [searchValue, setSearchValue] = useState("");
    const defferedSearchValue = useDeferredValue(searchValue);
    function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value);
    }

    if (!songListData) {
        return <>The list is empty</>;
    }

    const { categories, categoriesCounts } = songListData;

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
            <FilteredList
                defferedSearchValue={defferedSearchValue}
                selectedCategoryIndex={selectedCategoryIndex}
                privileges={privileges}
            />
            {isAdmin(privileges) && <ModalAdd modalRef={modalAddRef} />}
        </>
    );
}

function exportJSON(songListData: Song[]) {
    const jsonStringData = `data:text/json;chatset=utf8,${encodeURIComponent(
        JSON.stringify(songListData),
    )}`;
    const link = document.createElement("a");
    link.href = jsonStringData;
    link.download = "songList.json";

    link.click();
}

type FilteredListProps = {
    privileges: number;
    defferedSearchValue: string;
    selectedCategoryIndex: number;
};

const FilteredList = memo(function FilteredList({
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

function ModalAdd({
    modalRef,
}: {
    modalRef: React.RefObject<HTMLDialogElement>;
}) {
    const [artistValue, setArtistValue] = useState("");
    const [songNameValue, setSongNameValue] = useState("");
    const [tagValue, setTagValue] = useState("");

    const { mutate: addSong } = clientAPI.songlist.addSong.useMutation({
        onMutate() {
            toast.loading("Adding");
        },
        onSuccess() {
            setArtistValue("");
            setSongNameValue("");
            setTagValue("");
            toast.dismiss();
            toast.success("Added");
            modalRef.current?.close();
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    return (
        <dialog
            ref={modalRef}
            className="border border-slate-500 bg-slate-900 text-slate-50"
            onSubmit={(event) => {
                event.preventDefault();
                let artistCapitalFirst = artistValue[0]?.toUpperCase();
                if (!artistCapitalFirst) {
                    toast.error("Empty artist");
                    return;
                }

                artistCapitalFirst += artistValue.slice(1);
                addSong({
                    artist: artistCapitalFirst,
                    songName: songNameValue,
                    tag: tagValue,
                });
            }}
        >
            <button
                onClick={() => modalRef.current?.close()}
                className={`${buttonStyles} mb-1`}
            >
                Close
            </button>
            <form className="grid-cols-songEdit grid items-center gap-2">
                <label htmlFor="artist-add">Artist</label>
                <input
                    onChange={(event) => setArtistValue(event.target.value)}
                    value={artistValue}
                    id="artist-add"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="songName-add">Song name</label>
                <input
                    onChange={(event) => setSongNameValue(event.target.value)}
                    value={songNameValue}
                    id="songName-add"
                    className={searchBarStyles}
                    type="text"
                />
                <label htmlFor="tag-add">Tag</label>
                <input
                    onChange={(event) => setTagValue(event.target.value)}
                    value={tagValue}
                    id="tag-add"
                    className={searchBarStyles}
                    type="text"
                />
                <button type="submit" className={`${buttonStyles} col-span-2`}>
                    Add
                </button>
            </form>
        </dialog>
    );
}

function ModalDelete({
    id,
    modalRef,
    songName,
    artist,
}: {
    id?: number;
    songName?: string;
    artist?: string;
    modalRef: React.RefObject<HTMLDialogElement>;
}) {
    const { mutate: deleteSong } = clientAPI.songlist.deleteSong.useMutation({
        onMutate() {
            toast.loading("Deleting");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Deleted");
            modalRef.current?.close();
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });
    return (
        <dialog
            ref={modalRef}
            className="border border-slate-500 bg-slate-900 text-slate-50"
        >
            <section className="grid grid-cols-2 gap-1 ">
                <h2 className="col-start-1 col-end-3">
                    Are you sure you want to delete {artist} - {songName}?
                </h2>
                {id !== undefined && (
                    <button
                        className={buttonStyles}
                        onClick={() => deleteSong({ id })}
                    >
                        Yes!
                    </button>
                )}
                <button
                    className="rounded border-2 border-transparent bg-slate-600 p-1 hover:border-slate-300"
                    onClick={() => modalRef.current?.close()}
                >
                    No!✋
                </button>
            </section>
        </dialog>
    );
}

function ModalEdit({
    song,
    modalRef,
}: {
    song: Song | null;
    modalRef: React.RefObject<HTMLDialogElement>;
}) {
    const [artistValue, setArtistValue] = useState("");
    const [songNameValue, setSongNameValue] = useState("");
    const [tagValue, setTagValue] = useState("");
    const [playCountValue, setPlayCountValue] = useState(0);
    const [likeCountValue, setLikeCountValue] = useState(0);
    useEffect(() => {
        setArtistValue(song?.artist ?? "");
        setSongNameValue(song?.songName ?? "");
        setTagValue(song?.tag ?? "");
        setPlayCountValue(song?.playCount ?? 0);
        setLikeCountValue(song?.likeCount ?? 0);
    }, [
        song?.songName,
        song?.tag,
        song?.artist,
        song?.playCount,
        song?.likeCount,
    ]);

    const { mutate: changeSong } = clientAPI.songlist.changeSong.useMutation({
        onSuccess() {
            toast.dismiss();
            toast.success("Changed");
            modalRef.current?.close();
        },
        onMutate() {
            toast.loading("Changing");
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Change failed, ${error.message}`);
        },
    });
    return (
        <dialog
            className="border border-slate-500 bg-slate-900 text-slate-50"
            onSubmit={(event) => {
                event.preventDefault();
                if (!song) {
                    return;
                }
                changeSong({
                    id: song.id ?? -1,
                    artist: artistValue,
                    songName: songNameValue,
                    tag: tagValue,
                    playCount: playCountValue,
                    likeCount: likeCountValue,
                });
            }}
            ref={modalRef}
        >
            <button
                onClick={() => modalRef.current?.close()}
                className={`${buttonStyles} mb-1`}
            >
                Close
            </button>
            <form className="grid grid-cols-mobileEdit items-center gap-2 sm:grid-cols-desktopEdit">
                <label htmlFor="artist-edit">Artist</label>
                <input
                    onChange={(event) => setArtistValue(event.target.value)}
                    value={artistValue}
                    id="artist-edit"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="songName-edit">Song name</label>
                <input
                    onChange={(event) => setSongNameValue(event.target.value)}
                    value={songNameValue}
                    id="songName-edit"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="tag-edit">Tag</label>
                <input
                    onChange={(event) => setTagValue(event.target.value)}
                    value={tagValue}
                    id="tag-edit"
                    className={inputStyles}
                    type="text"
                />
                <label htmlFor="play-count-edit">Play count</label>
                <input
                    onChange={(event) =>
                        setPlayCountValue(parseInt(event.target.value))
                    }
                    value={playCountValue}
                    id="play-count-edit"
                    className={inputStyles}
                    type="number"
                />
                <label htmlFor="like-count-edit">Like count</label>
                <input
                    onChange={(event) =>
                        setLikeCountValue(parseInt(event.target.value))
                    }
                    value={likeCountValue}
                    id="like-count-edit"
                    className={inputStyles}
                    type="number"
                />
                <button type="submit" className={`${buttonStyles} col-span-2`}>
                    Change
                </button>
            </form>
        </dialog>
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
                            className="flex w-6 justify-center border border-sky-800 bg-sky-800 px-1 hover:border-slate-50"
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

function splitByArtist(artistFirstLetters: string[], list?: Song[]): Song[][] {
    artistFirstLetters.length = 0;
    const result: Song[][] = [];
    if (list === undefined || list.length === 0) return result;

    let curArtist = list[0]?.artist;
    let curArtistArray: Song[] = [];
    for (const song of list) {
        if (song.artist !== curArtist) {
            result.push(curArtistArray);
            curArtistArray = [];
            curArtist = song.artist;
        }
        curArtistArray.push(song);
    }
    result.push(curArtistArray);

    const firstBlock = result[0];
    if (!firstBlock) {
        return result;
    }

    const firstArtistFirstLetter = firstBlock[0]?.artist[0];
    if (!firstArtistFirstLetter) {
        return result;
    }

    artistFirstLetters.push(firstArtistFirstLetter);
    let letterIndex = 0;
    for (const block of result) {
        const curArtistFirstLetter = block[0]?.artist[0];
        if (
            curArtistFirstLetter &&
            artistFirstLetters[letterIndex] !== curArtistFirstLetter
        ) {
            artistFirstLetters.push(curArtistFirstLetter);
            letterIndex++;
        }
    }

    return result;
}

function filterByCategorySonglist(
    selectedCategoryIndex: number,
    categories: string[],
    songList?: Song[],
) {
    const selectedCategory = categories[selectedCategoryIndex];
    return selectedCategory === undefined
        ? songList
        : songList?.filter(({ tag }) => {
              return selectedCategoryIndex === -1
                  ? true
                  : tag?.includes(selectedCategory.toLowerCase());
          });
}

function filterBySearch(search: string | null, songlist?: Song[]) {
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
