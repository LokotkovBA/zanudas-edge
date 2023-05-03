"use client";

import { dehydrate, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { clientAPI } from "~/client/ClientProvider";
import PrivilegeSetter from "./PrivilegeSetter";
import { useState } from "react";
import { searchBarStyles } from "../styles/searchBar";

export function SearchableUsersList() {
    const queryClient = useQueryClient();
    dehydrate(queryClient);
    const { data: usersData } = clientAPI.users.getAll.useQuery();

    const [filterString, setFilterString] = useState("");

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
            <ul className="flex items-center gap-2 px-20 py-2">
                {usersData
                    ?.filter(({ name }) =>
                        name?.toLowerCase().includes(filterString),
                    )
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
