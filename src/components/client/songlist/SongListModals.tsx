"use state";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";
import { inputStyles } from "~/components/styles/input";
import { searchBarStyles } from "~/components/styles/searchBar";
import { type Song } from "~/drizzle/types";

type ModalAddProps = {
    modalRef: React.RefObject<HTMLDialogElement>;
};

export function ModalAdd({ modalRef }: ModalAddProps) {
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
            className="border p-4 border-slate-500 bg-slate-900 text-slate-50"
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

type ModalDeleteProps = {
    id?: number;
    songName?: string;
    artist?: string;
    modalRef: React.RefObject<HTMLDialogElement>;
};

export function ModalDelete({
    id,
    modalRef,
    songName,
    artist,
}: ModalDeleteProps) {
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
            className="border p-4 border-slate-500 bg-slate-900 text-slate-50"
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

type ModalEditProps = {
    song: Song | null;
    modalRef: React.RefObject<HTMLDialogElement>;
};

export function ModalEdit({ song, modalRef }: ModalEditProps) {
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
            className="border p-4 border-slate-500 bg-slate-900 text-slate-50"
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
