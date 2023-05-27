import { type FormEvent, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";
import { inputStyles } from "~/components/styles/input";
import { searchBarStyles } from "~/components/styles/searchBar";

export function IntroAddButton() {
    const modalRef = useRef<HTMLDialogElement>(null);

    const mainMessageRef = useRef<HTMLInputElement>(null);
    const symbolRef = useRef<HTMLInputElement>(null);
    const [preMessageValue, setPreMessageValue] = useState("");
    const [progressValue, setProgressValue] = useState("");

    const { mutate: addEntry } = clientAPI.intro.add.useMutation({
        onMutate() {
            toast.loading("Adding");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Added");
            modalRef.current?.close();
            setProgressValue("");
            setPreMessageValue("");
            if (mainMessageRef.current) {
                mainMessageRef.current.value = "";
            }
            if (symbolRef.current) {
                symbolRef.current.value = "";
            }
        },
        onError(error) {
            toast.dismiss();
            toast.error(`Error: ${error.message}`);
        },
    });

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!mainMessageRef.current || !symbolRef.current) {
            return toast.error("The impossible just happened");
        }
        if (progressValue !== "" && preMessageValue === "") {
            return toast.error("Empty progress message");
        }
        if (mainMessageRef.current.value === "") {
            return toast.error("Empty main message");
        }

        addEntry({
            mainMessage: mainMessageRef.current.value,
            preMessage: preMessageValue,
            symbol: symbolRef.current.value,
            progress: progressValue === "" ? null : parseInt(progressValue),
        });
    }
    return (
        <>
            <button
                className={buttonStyles}
                onClick={() => modalRef.current?.showModal()}
            >
                Add new message
            </button>
            <dialog
                className="rounded border border-slate-400 bg-slate-900 text-slate-50"
                ref={modalRef}
            >
                <button
                    className={`${buttonStyles} mb-4`}
                    type="button"
                    onClick={() => modalRef.current?.close()}
                >
                    Close
                </button>
                <form className="grid gap-2" onSubmit={onSubmit}>
                    <label className="col-span-4" htmlFor="preMessage">
                        Progress message
                    </label>
                    <input
                        id="preMessage"
                        disabled={progressValue === ""}
                        value={preMessageValue}
                        onChange={(event) => {
                            setPreMessageValue(event.target.value);
                        }}
                        className={`${inputStyles} col-span-4 disabled:bg-slate-700`}
                        type="text"
                    />
                    <label className="col-span-4" htmlFor="mainMessage">
                        Main message
                    </label>
                    <input
                        id="mainMessage"
                        className={`${inputStyles} col-span-4`}
                        ref={mainMessageRef}
                        type="text"
                    />
                    <label
                        className="col-span-2 justify-self-center"
                        htmlFor="symbol"
                    >
                        Symbol
                    </label>
                    <label
                        className="col-span-2 justify-self-center"
                        htmlFor="progress"
                    >
                        Progress
                    </label>
                    <input
                        id="symbol"
                        className={`${searchBarStyles} col-span-2 w-[5ch] justify-self-center text-center`}
                        ref={symbolRef}
                        type="text"
                    />
                    <input
                        id="progress"
                        className={`${searchBarStyles} col-span-2 w-[5ch] justify-self-center`}
                        value={progressValue}
                        onChange={(event) => {
                            const value = parseInt(event.target.value);
                            const valueIsNaN = isNaN(value);
                            if (valueIsNaN) {
                                setPreMessageValue("");
                            }
                            setProgressValue(
                                valueIsNaN ? "" : value.toString(),
                            );
                        }}
                        type="text"
                    />
                    <button
                        className={`${buttonStyles} col-span-4 mt-4`}
                        type="submit"
                    >
                        Add
                    </button>
                </form>
            </dialog>
        </>
    );
}
