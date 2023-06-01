import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";

type ModalDeleteProps = {
    id: number;
    title: string;
    modalDeleteRef: React.RefObject<HTMLDialogElement>;
    modalChangeRef: React.RefObject<HTMLDialogElement>;
};

export function ModalDeleteEvent({
    id,
    title,
    modalDeleteRef,
    modalChangeRef,
}: ModalDeleteProps) {
    const { mutate: deleteEvent } = clientAPI.events.delete.useMutation({
        onMutate() {
            toast.loading("Deleting");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Deleted");
            modalChangeRef.current?.close();
            modalDeleteRef.current?.close();
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    return (
        <dialog
            ref={modalDeleteRef}
            className="border border-slate-500 bg-slate-900 text-slate-50"
        >
            <section className="grid grid-cols-2 gap-1 ">
                <h2 className="col-start-1 col-end-3">
                    Are you sure you want to delete {title}?
                </h2>
                <button
                    className={buttonStyles}
                    onClick={() => deleteEvent(id)}
                >
                    Yes!
                </button>
                <button
                    className="rounded border-2 border-transparent bg-slate-600 p-1 hover:border-slate-300"
                    onClick={() => modalDeleteRef.current?.close()}
                >
                    No!✋
                </button>
            </section>
        </dialog>
    );
}
