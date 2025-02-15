"use client";
import { useRef } from "react";
import { buttonStyles } from "~/components/styles/button";
import { AdminPanel } from "./AdminPanel";

export function AdminButton() {
    const modalRef = useRef<HTMLDialogElement>(null);

    function onClick() {
        modalRef.current?.showModal();
    }

    return (
        <>
            <button onClick={onClick} className={buttonStyles}>
                Overlay text
            </button>
            <AdminPanel modalRef={modalRef} />
        </>
    );
}
