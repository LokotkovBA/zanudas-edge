import "./globals.css";
import { Inter } from "next/font/google";
import { type PropsWithChildren } from "react";
import { ClientProvider } from "~/client/ClientProvider";

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

export const preferredRegion = ["arn1", "fra1", "sfo1"];

export default async function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en" className={`${inter.className} scroll-smooth`}>
            <ClientProvider>{children}</ClientProvider>
        </html>
    );
}
