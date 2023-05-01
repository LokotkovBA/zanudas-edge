"use client";

import { useState } from "react";
import { clientAPI } from "~/client/ClientProvider";

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
        updatePrivileges({ user_id, privileges })
    }

    const { mutate: updatePrivileges } = clientAPI.users.updatePrivileges.useMutation()

    return (
        <>
            {currentPrivileges.map((priv, index) => {
                return (
                    <button
                        key={index}
                        onClick={() => onPrivilegeClick(priv, index)}
                    >
                        {priv}
                    </button>
                );
            })}
            <button onClick={onSetClick}>Set</button>
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
