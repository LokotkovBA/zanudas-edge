import SignInButton from "~/components/SignInButton";
import SignOutButton from "~/components/SignOutButton";
import { useServerGetUser } from "~/rsc/useServerGetUser";


export default async function Home() {
    const user = await useServerGetUser();
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            {!!user && `Hello ${user.name}`}
            {!user && <SignInButton />}
            {!!user && <SignOutButton />}
        </main>
    );
}

export const runtime = "edge";
