"use client";

import { useRef } from "react";
import { buttonStyles } from "~/components/styles/button";
import { ModalAddEvent } from "./ModalAddEvent";

export function AddEventButton() {
    const modalAddRef = useRef<HTMLDialogElement>(null);
    return (
        <>
            <button
                className={buttonStyles}
                onClick={() => modalAddRef.current?.showModal()}
            >
                Add event
            </button>
            <ModalAddEvent modalRef={modalAddRef} />
        </>
    );
}
