import { type PropsWithChildren } from "react";

export default function OverlayLayout({ children }: PropsWithChildren) {
    return <body className="text-slate-50">{children}</body>;
}
