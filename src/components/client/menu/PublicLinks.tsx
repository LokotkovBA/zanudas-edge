"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { linkStyles } from "~/components/styles/link";
import clsx from "clsx";

export default function PublicLinks() {
    const pathname = usePathname();
    return (
        <>
            <li className="md:ml-auto">
                <Link
                    className={clsx(linkStyles, {
                        "text-sky-400": pathname === "/queue",
                    })}
                    href="/queue"
                >
                    Queue
                </Link>
            </li>
            <li>
                <Link
                    className={clsx(linkStyles, {
                        "text-sky-400": pathname === "/songlist",
                    })}
                    href="/songlist"
                >
                    Song list
                </Link>
            </li>
            <li>
                <Link
                    className={clsx(linkStyles, {
                        "text-sky-400": pathname === "/karaokelist",
                    })}
                    href="/karaokelist"
                >
                    Karaoke list
                </Link>
            </li>
        </>
    );
}
