import Link from "next/link";
import { serverAPI } from "~/server/api";
import SignInButton from "../client/SignInButton";
import Image from "next/image";
import SignOutButton from "../client/SignOutButton";
import { isAdmin } from "~/utils/privileges";
import { linkStyles } from "../styles/link";
import PublicLinks from "../client/PublicLinks";
import AdminLinks from "../client/AdminLinks";
import DonationAlertsIcon from "~/svg/DonationAlertsIcon";

export async function Menu() {
    const user = await serverAPI.getAuth.fetch();
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
                        className={`${linkStyles} flex items-center gap-1 fill-slate-50`}
                        href="https://www.donationalerts.com/r/zanuda"
                    >
                        <DonationAlertsIcon size={"1.2em"} />
                        Request
                    </Link>
                </li>
                {user && (
                    <li>
                        <ProfileBlock image={user.image} name={user.name} />
                    </li>
                )}
                <li>
                    {!user && <SignInButton />}
                    {user && <SignOutButton />}
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
