"use client";
import clsx from "clsx";
import { signIn } from "~/auth/client";
import { buttonStyles } from "../styles/button";
import TwitchIcon from "~/svg/TwitchIcon";
import { toast } from "react-hot-toast";

type SignInButtonProps = {
    className?: string;
};

async function onClick() {
    toast.loading("Redirecting");
    await signIn("twitch");
    toast.dismiss();
    toast.success("Success");
}

const SignInButton: React.FC<SignInButtonProps> = ({ className = "" }) => {
    return (
        <button
            className={clsx(className, buttonStyles, "flex items-center gap-1")}
            onClick={onClick}
        >
            <TwitchIcon size="1.2rem" />
            Sign in
        </button>
    );
};

export default SignInButton;
