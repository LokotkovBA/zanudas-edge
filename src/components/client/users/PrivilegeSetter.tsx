"use client";

import { useState } from "react";
import { clientAPI } from "~/client/ClientProvider";
import { buttonStyles } from "~/components/styles/button";
import clsx from "clsx";
import { toast } from "react-hot-toast";

type PrivilegeSetterProps = {
    user_id: string;
    privileges: number;
};

const PrivilegeSetter: React.FC<PrivilegeSetterProps> = ({
    user_id,
    privileges,
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
        clientAPI.users.updatePrivileges.useMutation({
            onMutate() {
                toast.loading("Setting");
            },
            onSuccess() {
                toast.dismiss();
                toast.success("Set");
            },
            onError(error) {
                toast.dismiss();
                toast.error(`Error: ${error.message}`);
            },
        });

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
export default PrivilegeSetter;

const roles = [
    "Master",
    "Admin",
    "Mod",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
];

function parsePrivileges(privileges: number) {
    return leadingZero(privileges.toString(2), 11).split("");
}

function leadingZero(value: string, desiredLength: number) {
    return "0".repeat(desiredLength - value.length) + value;
}
