"use client";
import clsx from "clsx";
import { signIn } from "~/auth/client";
import { buttonStyles } from "../styles/button";
import TwitchIcon from "~/svg/TwitchIcon";
import { LoaderIcon } from "~/svg/LoaderIcon";
import { useState } from "react";

type SignInButtonProps = {
    className?: string;
};

const SignInButton: React.FC<SignInButtonProps> = ({ className = "" }) => {
    const [isRedirecting, setIsReditecting] = useState(false);

    async function onClick() {
        setIsReditecting(true);
        await signIn("twitch");
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
            {!isRedirecting && (
                <>
                    <TwitchIcon size="1.2rem" />
                    Sign in
                </>
            )}
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

export default SignInButton;
