import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { buttonStyles } from "~/components/styles/button";
import { deleteButtonStyles } from "~/components/styles/deleteButton";
import { type Song } from "~/drizzle/types";
import { Cross } from "~/svg/Cross";
import { ThumbsDown } from "~/svg/ThumbsDown";
import { ThumbsUp } from "~/svg/ThumbsUp";
import { isAdmin, isMod } from "~/utils/privileges";

type SongListEntryProps = {
    index: number;
    song: Song;
    setModalData: (entry: Song) => void;
    modalEditRef: React.RefObject<HTMLDialogElement>;
    modalDeleteRef: React.RefObject<HTMLDialogElement>;
};

export function SongListEntry({
    index,
    song,
    modalEditRef,
    modalDeleteRef,
    setModalData,
}: SongListEntryProps) {
    const { data: userData } = clientAPI.getAuth.useQuery();
    const { mutate: addToQueue } = clientAPI.queue.add.useMutation({
        onMutate() {
            toast.loading("Adding to queue");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Added");
            socketClient.emit("invalidate", { username: userData?.encUser });
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    return (
        <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
            <div
                onClick={() =>
                    copyToClipboard(`${song.artist} - ${song.songName}`)
                }
                className="flex w-full cursor-pointer items-end justify-between hover:text-sky-500"
            >
                <p className="pt-2 leading-5">{song.songName}</p>
                <section className="flex items-end gap-1 leading-none">
                    {!!song.likeCount && (
                        <>
                            <span className="text-end">
                                {Math.abs(song.likeCount)}
                            </span>
                            {song.likeCount > 0 && (
                                <ThumbsUp
                                    size={"1.5rem"}
                                    className="fill-green-400"
                                />
                            )}
                            {song.likeCount < 0 && (
                                <ThumbsDown
                                    size={"1.5rem"}
                                    className="translate-y-2 fill-red-400"
                                />
                            )}
                        </>
                    )}
                    {!!song.playCount && song.playCount > 1 && (
                        <p className="ml-1 whitespace-nowrap">
                            x{song.playCount}🎹
                        </p>
                    )}
                </section>
            </div>
            {isMod(userData?.privileges) && (
                <button
                    onClick={() => {
                        addToQueue({
                            artist: song.artist,
                            songName: song.songName,
                            tag: song.tag,
                        });
                    }}
                    className={buttonStyles}
                >
                    Add
                </button>
            )}
            {isAdmin(userData?.privileges) && (
                <>
                    <button
                        className={buttonStyles}
                        onClick={() => {
                            setModalData(song);
                            modalEditRef.current?.showModal();
                        }}
                    >
                        Change
                    </button>
                    <button
                        onClick={() => {
                            setModalData(song);
                            modalDeleteRef.current?.showModal();
                        }}
                        className={deleteButtonStyles}
                    >
                        <Cross
                            id={`${index}-close`}
                            className="fill-slate-50"
                            size="1.5rem"
                        />
                    </button>
                </>
            )}
        </div>
    );
}

function copyToClipboard(text: string) {
    toast.promise(navigator.clipboard.writeText(text), {
        loading: "Copying",
        success: "Copied",
        error: "Error",
    });
}
