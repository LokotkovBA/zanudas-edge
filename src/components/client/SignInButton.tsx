"use client";
import clsx from "clsx";
import { signIn } from "~/auth/client";

type SignInButtonProps = {
    className?: string;
};

const SignInButton: React.FC<SignInButtonProps> = ({ className = "" }) => {
    return (
        <button className={clsx(className)} onClick={() => signIn("twitch")}>
            Sign in
        </button>
    );
};

export default SignInButton;
