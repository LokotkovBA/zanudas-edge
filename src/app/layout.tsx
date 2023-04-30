import "./globals.css";
import { Inter } from "next/font/google";
import { Menu } from "~/components/server/Menu";
import { api } from "~/server/api";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
    title: "Kalny app",
    description: "Automated queue and song list for Zanuda's kalny streams",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await api.whoami.fetch();
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-900 text-slate-50`}>
                <header className="flex px-40 py-3 items-center">
                    <h1 className="text-3xl text-amber-400">{`>3`}</h1>
                    {/* @ts-expect-error Async Server Component */}
                    <Menu />
                </header>
                {children}
            </body>
        </html>
    );
}
