import Link from "next/link";
import { api } from "~/server/api";
import SignInButton from "../client/SignInButton";
import Image from "next/image";
import SignOutButton from "../client/SignOutButton";
import { isAdmin } from "~/utils/privileges";
import { linkStyles } from "../styles/link";
import PublicLinks from "../client/PublicLinks";
import AdminLinks from "../client/AdminLinks";

export async function Menu() {
    const user = await api.whoami.fetch();
    return (
        <nav className="w-full">
            <menu className="flex items-center gap-6 text-lg">
                <li>
                    <h1 className="text-3xl text-amber-400">
                        <Link href="/">{`>3`}</Link>
                    </h1>
                </li>
                <PublicLinks />
                {isAdmin(user?.privileges) && <AdminLinks />}
                <li className="ml-auto">
                    <Link
                        target="_blank"
                        className={linkStyles}
                        href="https://www.donationalerts.com/r/zanuda"
                    >
                        Request
                    </Link>
                </li>
                {user && (
                    <li>
                        <ProfileBlock image={user.image} name={user.name} />
                    </li>
                )}
                <li>
                    {!user && <SignInButton className={linkStyles} />}
                    {user && <SignOutButton className={linkStyles} />}
                </li>
            </menu>
        </nav>
    );
}

function ProfileBlock({ image, name }: { image: string; name: string }) {
    return (
        <div className="flex items-center gap-4">
            <Image
                priority={true}
                className="rounded-full"
                alt={`${name}'s profile picture`}
                width={45}
                height={45}
                src={image}
            />
            <span className="text-amber-400">{name}</span>
        </div>
    );
}
