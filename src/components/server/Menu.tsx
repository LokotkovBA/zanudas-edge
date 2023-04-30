import Link from "next/link";
import { api } from "~/server/api";
import SignInButton from "../client/SignInButton";
import linkStyles from "../styles/link";
import Image from "next/image";
import SignOutButton from "../client/SignOutButton";

export async function Menu() {
    const user = await api.whoami.fetch();
    return (
        <nav className="w-full">
            <menu className="flex gap-8 items-center">
                <li className="ml-auto">
                    <Link className={linkStyles} href="/queue">
                        Queue
                    </Link>
                </li>
                <li>
                    <Link className={linkStyles} href="/songlist">
                        Song list
                    </Link>
                </li>
                <li className="ml-auto">
                    <Link
                        target="_blank"
                        className={linkStyles}
                        href="https://www.donationalerts.com/r/zanuda"
                    >
                        Request
                    </Link>
                </li>
                <li className="flex gap-1 items-center">
                    {!user && <SignInButton className={linkStyles} />}
                    {!!user && (
                        <ProfileBlock image={user.image} name={user.name} />
                    )}
                </li>
            </menu>
        </nav>
    );
}

function ProfileBlock({ image, name }: { image: string; name: string }) {
    return (
        <>
            <Image
                className="rounded-full border-slate-700 border-2"
                alt={`${name}'s profile picture`}
                width={45}
                height={45}
                src={image}
            />
            <span className="text-amber-400">{name}</span>
            <SignOutButton />
        </>
    );
}
