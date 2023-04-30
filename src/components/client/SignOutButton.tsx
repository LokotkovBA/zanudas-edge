"use client";
import clsx from "clsx";
import { signOut } from "~/auth/client";
type SignOutButtonProps = {
    className?: string;
};

const SignOutButton: React.FC<SignOutButtonProps> = ({ className = "" }) => {
    return (
        <button className={clsx(className)} onClick={() => signOut()}>
            Sign out
        </button>
    );
};

export default SignOutButton;
