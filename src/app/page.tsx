import { Inter } from "next/font/google";
import SignInButton from "~/components/SignInButton";
import { drizzleClient } from "~/drizzle/db";
import { users } from "~/drizzle/schemas/auth";

const inter = Inter({ subsets: ["latin"] });

export default async function Home() {
    const kek = await drizzleClient.select().from(users).all();
    console.log(kek);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <SignInButton />
        </main>
    );
}

export const runtime = "experimental-edge";
