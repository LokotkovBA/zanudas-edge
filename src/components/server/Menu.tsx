import Link from "next/link";
import { api } from "~/server/api";
import SignInButton from "../client/SignInButton";
import buttonStyles from "../styles/button"

export async function Menu() {
    const user = await api.whoami.fetch();
    return (
        <nav>
            <menu>
                <li>
                    <Link className={buttonStyles} href="/queue">Queue</Link>
                </li>
                <li>
                    <Link className={buttonStyles} href="/songlist">Song list</Link>
                </li>
                <li>
                    <Link className={buttonStyles} href="https://www.donationalerts.com/r/zanuda">Request</Link>
                </li>
                <li>
                    <SignInButton className={buttonStyles} />
                </li>
            </menu>
        </nav>
    )
}

