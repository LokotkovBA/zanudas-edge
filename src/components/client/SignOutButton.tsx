"use client";
import clsx from "clsx";
import { signOut } from "~/auth/client";
import { buttonStyles } from "../styles/button";
import { LoaderIcon } from "~/svg/LoaderIcon";
import { useState } from "react";

type SignOutButtonProps = {
    className?: string;
};

const SignOutButton: React.FC<SignOutButtonProps> = ({ className = "" }) => {
    const [isRedirecting, setIsReditecting] = useState(false);

    async function onClick() {
        setIsReditecting(true);
        await signOut();
    }

    return (
        <button
            className={clsx(
                className,
                buttonStyles,
                "flex w-24 items-center justify-around gap-1",
            )}
            onClick={onClick}
        >
            {!isRedirecting && "Sign out"}
            {isRedirecting && (
                <>
                    <LoaderIcon
                        size="1.7rem"
                        className="animate-spin fill-slate-50"
                    />
                </>
            )}
        </button>
    );
};

export default SignOutButton;
