"use client";

import Link from "next/link";
import { linkStyles } from "~/components/styles/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function AdminLinks() {
    const pathname = usePathname();
    return (
        <>
            <li>
                <Link
                    className={clsx(linkStyles, {
                        "text-sky-400": pathname === "/users",
                    })}
                    href="/users"
                >
                    Users
                </Link>
            </li>
            <li>
                <Link
                    className={clsx(linkStyles, {
                        "text-sky-400": pathname === "/intro",
                    })}
                    href="/intro"
                >
                    Intro
                </Link>
            </li>
        </>
    );
}
