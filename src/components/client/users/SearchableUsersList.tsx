"use client";

import Image from "next/image";
import { clientAPI } from "~/client/ClientProvider";
import PrivilegeSetter from "./PrivilegeSetter";
import { useRef, useState } from "react";
import { searchBarStyles } from "~/components/styles/searchBar";
import { isMod } from "~/utils/privileges";
import { buttonStyles } from "~/components/styles/button";
import { deleteButtonStyles } from "~/components/styles/deleteButton";
import { toast } from "react-hot-toast";
import { Cross } from "~/svg/Cross";

export function SearchableUsersList() {
    const { data: usersData } = clientAPI.users.getAll.useQuery();

    const [filterString, setFilterString] = useState("");

    const [onlyMods, setOnlyMods] = useState(false);

    const modalDeleteRef = useRef<HTMLDialogElement>(null);
    const [idToDelete, setIdToDelete] = useState("");
    const [nameToDelete, setNameToDelete] = useState("");

    return (
        <>
            <input
                name="user-search"
                className={searchBarStyles}
                placeholder="Search"
                onChange={(event) =>
                    setFilterString(event.target.value.toLowerCase())
                }
                value={filterString}
                type="text"
            />
            <button
                className={buttonStyles}
                onClick={() => setOnlyMods((prev) => !prev)}
            >
                {onlyMods ? "Not" : "Show"} only mods
            </button>
            <ul className="flex flex-wrap items-center gap-2 px-20 py-2">
                {usersData
                    ?.filter(({ name, privileges }) => {
                        let add =
                            name?.toLowerCase().includes(filterString) ?? false;
                        if (onlyMods) {
                            add &&= isMod(privileges);
                        }
                        return add;
                    })
                    .map(({ id, name, image, privileges }, index) => (
                        <li
                            className="flex flex-col items-center gap-2"
                            key={id}
                        >
                            <button
                                onClick={() => {
                                    setIdToDelete(id);
                                    setNameToDelete(name ?? "");
                                    modalDeleteRef.current?.showModal();
                                }}
                                className={`${deleteButtonStyles} self-end`}
                            >
                                <Cross
                                    id={`${index}-close`}
                                    className="fill-slate-50"
                                    size="1.5rem"
                                />
                            </button>
                            <h2 className="text-amber-400">{name}</h2>
                            {image && (
                                <Image
                                    className="rounded-full"
                                    width={45}
                                    height={45}
                                    alt={`${name}'s profile picture`}
                                    src={image}
                                />
                            )}
                            <PrivilegeSetter
                                user_id={id}
                                privileges={privileges}
                            />
                        </li>
                    ))}
            </ul>
            <ModalDelete
                user_id={idToDelete}
                modalRef={modalDeleteRef}
                name={nameToDelete}
            />
        </>
    );
}

function ModalDelete({
    user_id,
    name,
    modalRef,
}: {
    user_id?: string;
    name?: string;
    modalRef: React.RefObject<HTMLDialogElement>;
}) {
    const { mutate: deleteUser } = clientAPI.users.deleteUser.useMutation({
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
                    Are you sure you want to delete user {name}?
                </h2>
                {user_id !== undefined && (
                    <button
                        className={buttonStyles}
                        onClick={() => deleteUser({ user_id })}
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
