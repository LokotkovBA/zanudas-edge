"use client";
import { signIn } from "~/auth/client";

type SignInButtonProps = {};

const SignInButton: React.FC<SignInButtonProps> = () => {
    return <button onClick={() => signIn("twitch")}>Sign in</button>;
};

export default SignInButton;
