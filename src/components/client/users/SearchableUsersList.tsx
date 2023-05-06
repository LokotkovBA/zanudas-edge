"use client";

import Image from "next/image";
import { clientAPI } from "~/client/ClientProvider";
import PrivilegeSetter from "./PrivilegeSetter";
import { useState } from "react";
import { searchBarStyles } from "~/components/styles/searchBar";
import { isMod } from "~/utils/privileges";
import { buttonStyles } from "~/components/styles/button";

export function SearchableUsersList() {
    const { data: usersData } = clientAPI.users.getAll.useQuery();

    const [filterString, setFilterString] = useState("");

    const [onlyMods, setOnlyMods] = useState(false);

    return (
        <>
            <input
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
            <ul className="flex items-center gap-2 px-20 py-2">
                {usersData
                    ?.filter(({ name, privileges }) => {
                        let add =
                            name?.toLowerCase().includes(filterString) ?? false;
                        if (onlyMods) {
                            add &&= isMod(privileges);
                        }
                        return add;
                    })
                    .map(({ id, name, image, privileges }) => (
                        <li
                            className="flex flex-col items-center gap-2"
                            key={id}
                        >
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
        </>
    );
}
