import "./globals.css";
import { Inter } from "next/font/google";
import { Menu } from "~/components/server/Menu";
import { api } from "~/server/api";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
    title: "Kalny app",
    description: "Automated queue and song list for Zanuda's kalny streams",
    icons: "/logo.png",
    themeColor: "#020617",
    other: {
        google: "notranslate",
    },
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
                <header className="border-b border-b-slate-500 bg-slate-950 px-2 py-4 xl:px-40">
                    {/* @ts-expect-error Async Server Component */}
                    <Menu />
                </header>
                {children}
            </body>
        </html>
    );
}
