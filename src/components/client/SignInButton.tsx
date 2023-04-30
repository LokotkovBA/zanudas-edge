"use client";
import clsx from "clsx";
import { signIn } from "~/auth/client";
import { buttonStyles } from "../styles/button";
import TwitchIcon from "~/svg/TwitchIcon";

type SignInButtonProps = {
    className?: string;
};

const SignInButton: React.FC<SignInButtonProps> = ({ className = "" }) => {
    return (
        <button
            className={clsx(className, buttonStyles, "flex items-center gap-1")}
            onClick={() => signIn("twitch")}
        >
            <TwitchIcon size="1.2rem" />
            Sign in
        </button>
    );
};

export default SignInButton;
