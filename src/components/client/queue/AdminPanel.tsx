"use client";
import { type RefObject, useState, useEffect, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { clientAPI } from "~/client/ClientProvider";
import { socketClient } from "~/client/socketClient";
import { CheckBox } from "~/components/utils/CheckBox";

type AdminPanelProps = {
    modalRef: RefObject<HTMLDialogElement>;
};

export function AdminPanel({ modalRef }: AdminPanelProps) {
    const [isTextVisible, setIsTextVisible] = useState(false);
    const [overlayText, setOverlayText] = useState("");

    const { data: userData } = clientAPI.getAuth.useQuery();

    useEffect(() => {
        socketClient.on("overlay text", (message) => {
            const newText = z.string().safeParse(message);
            if (!newText.success) {
                toast.error("wrong overlay text");
                return;
            }

            setOverlayText(newText.data);
        });

        socketClient.on("overlay text visibility", (message) => {
            const newVisibility = z.string().safeParse(message);
            if (!newVisibility.success) {
                toast.error("wrong text visibility");
                return;
            }

            setIsTextVisible(newVisibility.data === "show");
        });

        socketClient.emit("get overlay text");
        socketClient.emit("get overlay text visibility");
        socketClient.emit("get overlay font size");
        socketClient.emit("get overlay entry count");

        return () => {
            socketClient.off("overlay text");
            socketClient.off("overlay text visibility");
        };
    }, []);

    function changeTextVisibility() {
        socketClient.emit("change overlay text visibility", {
            username: userData?.encUser,
        });
        toast.success("Success");
    }

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        socketClient.emit("change overlay text", {
            username: userData?.encUser,
            message: {
                value: overlayText,
            },
        });
        modalRef.current?.close();
        toast.success("Success");
    }

    return (
        <dialog
            className="rounded border border-slate-400 bg-slate-950"
            ref={modalRef}
        >
            <form
                onSubmit={onSubmit}
                className="flex flex-col gap-2 text-white"
            >
                <button
                    type="button"
                    onClick={() => modalRef.current?.close()}
                    className="mb-2 self-start rounded border border-transparent bg-slate-700 px-2 py-1 hover:border-slate-400"
                >
                    Close
                </button>
                <section className="flex gap-1 sm:gap-2">
                    <label className="cursor-pointer" htmlFor="is-text-visible">
                        Overlay text visibility
                    </label>
                    <input
                        onChange={changeTextVisibility}
                        id="is-text-visible"
                        checked={isTextVisible}
                        type="checkbox"
                        className="hidden"
                    />
                    <CheckBox
                        className="ml-auto self-center"
                        id="text-visibility"
                        checked={isTextVisible}
                        onClick={changeTextVisibility}
                    />
                </section>
                <label htmlFor="overlay-text">Overlay text</label>
                <textarea
                    id="overlay-text"
                    value={overlayText}
                    onChange={(event) => setOverlayText(event.target.value)}
                    className={`h-40 rounded border border-slate-400 bg-slate-950 p-2`}
                />
                <button
                    className="rounded border border-transparent bg-slate-700 py-2 hover:border-slate-400"
                    type="submit"
                >
                    Submit
                </button>
            </form>
        </dialog>
    );
}
