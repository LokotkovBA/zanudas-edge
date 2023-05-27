"use client";

import {
    type FormEvent,
    memo,
    useDeferredValue,
    useRef,
    useState,
} from "react";
import { toast } from "react-hot-toast";
import { clientAPI } from "~/client/ClientProvider";
import { IntroAddButton } from "./IntroAddButton";
import { searchBarStyles } from "~/components/styles/searchBar";
import { buttonStyles } from "~/components/styles/button";
import { Cross } from "~/svg/Cross";
import { deleteButtonStyles } from "~/components/styles/deleteButton";

export function SearchableIntroList() {
    const [filterString, setFilterString] = useState("");
    const deferredFilterString = useDeferredValue(filterString);

    return (
        <>
            <IntroAddButton />
            <input
                placeholder="Search"
                className={searchBarStyles}
                type="text"
                value={filterString}
                onChange={(event) => setFilterString(event.target.value)}
            />
            <FilteredList filterString={deferredFilterString} />
        </>
    );
}

const FilteredList = memo(function FilteredList({
    filterString,
}: {
    filterString: string;
}) {
    const { data: introData } = clientAPI.intro.getAll.useQuery();
    const modalDeleteRef = useRef<HTMLDialogElement>(null);
    const [messageToDelete, setMessageToDelete] = useState("");
    const [idToDelete, setIdToDelete] = useState(-1);

    return (
        <>
            <ul className="flex flex-col gap-4 md:flex-row md:flex-wrap">
                {introData
                    ?.filter(
                        ({ mainMessage, preMessage }) =>
                            mainMessage.includes(filterString) ||
                            preMessage.includes(filterString),
                    )
                    .map((entry) => (
                        <IntroEntry
                            key={entry.id}
                            modalDeleteRef={modalDeleteRef}
                            setIdToDelete={setIdToDelete}
                            setMessageToDelete={setMessageToDelete}
                            {...entry}
                        />
                    ))}
            </ul>
            <ModalDelete
                id={idToDelete}
                modalRef={modalDeleteRef}
                message={messageToDelete}
            />
        </>
    );
});

type IntroEntryProps = {
    id: number;
    mainMessage: string;
    preMessage: string;
    symbol: string;
    progress: number | null;
    modalDeleteRef: React.RefObject<HTMLDialogElement>;
    setIdToDelete: (id: number) => void;
    setMessageToDelete: (message: string) => void;
};
function IntroEntry({
    id,
    mainMessage,
    preMessage,
    symbol,
    progress,
    modalDeleteRef,
    setMessageToDelete,
    setIdToDelete,
}: IntroEntryProps) {
    const mainMessageRef = useRef<HTMLInputElement>(null);
    const symbolRef = useRef<HTMLInputElement>(null);
    const [progressValue, setProgressValue] = useState(
        progress?.toString() ?? "",
    );
    const [preMessageValue, setPreMessageValue] = useState(
        preMessage.toString(),
    );

    const { mutate: changeEntry } = clientAPI.intro.change.useMutation({
        onMutate() {
            toast.loading("Changing");
        },
        onSuccess() {
            toast.dismiss();
            toast.success("Changed");
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

        changeEntry({
            id,
            mainMessage: mainMessageRef.current.value,
            preMessage: preMessageValue,
            symbol: symbolRef.current.value,
            progress: progressValue === "" ? null : parseInt(progressValue),
        });
    }

    function onDeleteClick() {
        setMessageToDelete(mainMessage);
        setIdToDelete(id);
        modalDeleteRef.current?.showModal();
    }

    return (
        <li className="flex flex-col rounded border border-slate-400 bg-slate-950 p-6">
            <form className="grid grid-cols-4 gap-2 " onSubmit={onSubmit}>
                <button
                    onClick={onDeleteClick}
                    type="button"
                    className={`${deleteButtonStyles} col-start-4 mb-4 justify-self-end`}
                >
                    <Cross
                        className="fill-slate-50"
                        id={`close ${id}`}
                        size="2rem"
                    />
                </button>
                <label className="col-span-4" htmlFor={`${id}-preMessage`}>
                    Progress message
                </label>
                <input
                    id={`${id}-preMessage`}
                    disabled={progressValue === ""}
                    value={preMessageValue}
                    onChange={(event) => {
                        setPreMessageValue(event.target.value);
                    }}
                    className={`${searchBarStyles} col-span-4 disabled:bg-slate-700`}
                    type="text"
                />
                <label className="col-span-4" htmlFor={`${id}-mainMessage`}>
                    Main message
                </label>
                <input
                    id={`${id}-mainMessage`}
                    className={`${searchBarStyles} col-span-4`}
                    ref={mainMessageRef}
                    type="text"
                    defaultValue={mainMessage}
                />
                <label
                    className="col-span-2 justify-self-center"
                    htmlFor={`${id}-symbol`}
                >
                    Symbol
                </label>
                <label
                    className="col-span-2 justify-self-center"
                    htmlFor={`${id}-progress`}
                >
                    Progress
                </label>
                <input
                    id={`${id}-symbol`}
                    className={`${searchBarStyles} col-span-2 w-[5ch] justify-self-center text-center`}
                    ref={symbolRef}
                    type="text"
                    defaultValue={symbol}
                />
                <input
                    id={`${id}-progress`}
                    className={`${searchBarStyles} col-span-2 w-[5ch] justify-self-center`}
                    value={progressValue}
                    onChange={(event) => {
                        const value = parseInt(event.target.value);
                        const valueIsNaN = isNaN(value);
                        if (valueIsNaN) {
                            setPreMessageValue("");
                        }
                        setProgressValue(valueIsNaN ? "" : value.toString());
                    }}
                    type="text"
                />
                <button className={`${buttonStyles} col-span-4`} type="submit">
                    Change
                </button>
            </form>
        </li>
    );
}

function ModalDelete({
    id,
    message,
    modalRef,
}: {
    id: number;
    message: string;
    modalRef: React.RefObject<HTMLDialogElement>;
}) {
    const { mutate: deleteUser } = clientAPI.intro.delete.useMutation({
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
            <section className="grid grid-cols-2 gap-7 ">
                <h2 className="col-start-1 col-end-3 text-center">
                    Are you sure you want to delete message:
                    <br />
                    {message}
                </h2>
                <button onClick={() => deleteUser(id)} className={buttonStyles}>
                    Yes!
                </button>
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
