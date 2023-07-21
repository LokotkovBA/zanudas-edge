import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { buttonStyles } from "~/components/styles/button";

type ModalDeleteQueueEntryProps = {
    id?: number;
    artist?: string;
    songName?: string;
    donorName?: string;
    modalRef: React.RefObject<HTMLDialogElement>;
};

export function ModalDeleteQueueEntry({
    artist,
    songName,
    donorName,
    id,
    modalRef,
}: ModalDeleteQueueEntryProps) {
    const { data: userData } = clientAPI.getAuth.useQuery();
    const { mutate: deleteEntry } = clientAPI.queue.delete.useMutation({
        onMutate() {
            toast.loading("Deleting");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Deleted");
            modalRef.current?.close();
            socketClient.emit("invalidate", { username: userData?.encUser });
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
                    Are you sure you want to delete {artist} - {songName} from{" "}
                    {donorName || "Admin"}?
                </h2>
                {id !== undefined && (
                    <button
                        className={buttonStyles}
                        onClick={() => deleteEntry({ id })}
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
