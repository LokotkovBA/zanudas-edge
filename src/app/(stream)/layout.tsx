import { type PropsWithChildren } from "react";

export const metadata = {
    title: "Kalny overlay",
    description: "Overlay for kalny streams",
    themeColor: "#FFFFFF",
};

export default function OverlayLayout({ children }: PropsWithChildren) {
    return <body className="text-slate-50">{children}</body>;
}
