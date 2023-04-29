"use client";
import { signOut } from "~/auth/client";
type SignOutButtonProps = {};

const SignOutButton: React.FC<SignOutButtonProps> = () => {
    return <button onClick={() => signOut()}>Sign out</button>;
};

export default SignOutButton;
