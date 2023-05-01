"use client";

import { useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "../styles/button";
import clsx from "clsx";

type PrivilegeSetterProps = {
    user_id: string;
    privileges: number;
    roles: string[];
};

const PrivilegeSetter: React.FC<PrivilegeSetterProps> = ({
    user_id,
    privileges,
    roles,
}) => {
    const [currentPrivileges, setCurrentPrivileges] = useState(
        parsePrivileges(privileges),
    );

    function onPrivilegeClick(privilege: string, index: number) {
        setCurrentPrivileges((prev) => {
            prev[index] = privilege === "0" ? "1" : "0";
            return [...prev];
        });
    }

    function onSetClick() {
        const privileges = parseInt(currentPrivileges.join(""), 2);
        updatePrivileges({ user_id, privileges });
    }

    const { mutate: updatePrivileges } =
        clientAPI.users.updatePrivileges.useMutation();

    return (
        <>
            <div>
                {currentPrivileges.map((priv, index) => {
                    return (
                        <div key={index}>
                            <button
                                className={clsx("mr-1 w-[2ch] p-1", {
                                    "bg-green-600": priv === "1",
                                    "bg-red-600": priv === "0",
                                })}
                                onClick={() => onPrivilegeClick(priv, index)}
                            >
                                {priv}
                            </button>
                            {roles[index]}
                        </div>
                    );
                })}
            </div>
            <button
                className={`${buttonStyles} self-stretch`}
                onClick={onSetClick}
            >
                Set
            </button>
        </>
    );
};

function parsePrivileges(privileges: number) {
    return leadingZero(privileges.toString(2), 11).split("");
}

function leadingZero(value: string, desiredLength: number) {
    return "0".repeat(desiredLength - value.length) + value;
}

export default PrivilegeSetter;
