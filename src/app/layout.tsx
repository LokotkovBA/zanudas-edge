import "./globals.css";
import { Inter } from "next/font/google";
import { Menu } from "~/components/server/Menu";
import { ClientProvider } from "~/client/ClientProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
});

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
    return (
        <html lang="en">
            <body
                className={`${inter.variable} bg-slate-900 font-sans text-slate-50`}
            >
                <header className="border-b border-b-slate-500 bg-slate-950 px-2 py-4 xl:px-40">
                    {/* @ts-expect-error Async Server Component */}
                    <Menu />
                </header>
                <ClientProvider>{children}</ClientProvider>
                <Toaster
                    toastOptions={{
                        className:
                            "bg-slate-950 text-slate-50 border border-slate-500",
                    }}
                />
            </body>
        </html>
    );
}
