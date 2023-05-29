"use client";
import clsx from "clsx";
import { signOut } from "~/auth/client";
import { buttonStyles } from "../styles/button";
import { toast } from "react-hot-toast";
type SignOutButtonProps = {
    className?: string;
};

async function onClick() {
    toast.loading("Redirecting");
    await signOut();
    toast.dismiss();
    toast.success("Success");
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ className = "" }) => {
    return (
        <button className={clsx(className, buttonStyles)} onClick={onClick}>
            Sign out
        </button>
    );
};

export default SignOutButton;
