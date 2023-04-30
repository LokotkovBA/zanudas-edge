"use client";
import clsx from "clsx";
import { signOut } from "~/auth/client";
import { buttonStyles } from "../styles/button";
type SignOutButtonProps = {
    className?: string;
};

const SignOutButton: React.FC<SignOutButtonProps> = ({ className = "" }) => {
    return (
        <button
            className={clsx(className, buttonStyles)}
            onClick={() => signOut()}
        >
            Sign out
        </button>
    );
};

export default SignOutButton;
