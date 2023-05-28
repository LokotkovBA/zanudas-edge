import { type PropsWithChildren } from "react";
import localFont from "next/font/local";

const comicSans = localFont({
    src: "comicsansms3-webfont.woff2",
    variable: "--font-comic",
});

export default function OverlayLayout({ children }: PropsWithChildren) {
    return (
        <main
            className={`${comicSans.className} flex justify-center bg-indigo-500 p-6 text-5xl`}
        >
            {children}
        </main>
    );
}
