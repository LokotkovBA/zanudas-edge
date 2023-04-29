import SignInButton from "~/components/SignInButton";
import SignOutButton from "~/components/SignOutButton";
import { getUser } from "~/rsc/getUser";

export default async function Home() {
    const user = await getUser()
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            {!!user && `Hello ${user.name}`}
            {!user && <SignInButton />}
            {!!user && <SignOutButton />}
        </main>
    );
}

export const runtime = "experimental-edge";
