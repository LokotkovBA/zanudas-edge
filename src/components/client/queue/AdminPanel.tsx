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
    const [overlayFontSize, setOverlayFontSize] = useState("");
    const [overlayText, setOverlayText] = useState("");
    const [overlayEntryCount, setOvertlayEntryCount] = useState("");

    const { data: userData } = clientAPI.getAuth.useQuery();

    useEffect(() => {
        socketClient.on("overlay font size", (message) => {
            const newFontSize = z.string().safeParse(message);
            if (!newFontSize.success) {
                toast.error("wrong overlay font size");
                return;
            }

            setOverlayFontSize(newFontSize.data);
        });

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

        socketClient.on("overlay entry count", (message) => {
            const newEntryCount = z.string().safeParse(message);
            if (!newEntryCount.success) {
                toast.error("wrong entry count");
                return;
            }

            setOvertlayEntryCount(newEntryCount.data);
        });

        socketClient.emit("get overlay text");
        socketClient.emit("get overlay text visibility");
        socketClient.emit("get overlay font size");
        socketClient.emit("get overlay entry count");

        return () => {
            socketClient.off("overlay font size");
            socketClient.off("overlay text");
            socketClient.off("overlay text visibility");
            socketClient.off("overlay entry count");
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
        socketClient.emit("change overlay font size", {
            username: userData?.encUser,
            message: {
                value: overlayFontSize,
            },
        });
        socketClient.emit("change overlay entry count", {
            username: userData?.encUser,
            message: {
                value: overlayEntryCount,
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
                    className="mb-2 self-end rounded border border-transparent bg-slate-700 px-2 py-1 hover:border-slate-400"
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
                <section className="flex items-center gap-2">
                    <label htmlFor="font-size">Overlay font size</label>
                    <input
                        id="font-size"
                        onChange={(event) =>
                            setOverlayFontSize(event.target.value)
                        }
                        value={overlayFontSize}
                        type="text"
                        className={`ml-auto w-14 rounded border border-slate-400 bg-slate-950 p-2 sm:w-20`}
                    />
                </section>
                <section className="flex items-center gap-2">
                    <label htmlFor="entry-count">Overlay entry count</label>
                    <input
                        id="entry count"
                        onChange={(event) =>
                            setOvertlayEntryCount(event.target.value)
                        }
                        value={overlayEntryCount}
                        type="number"
                        className={`ml-auto w-12 rounded border border-slate-400 bg-slate-950 p-2 sm:w-20`}
                    />
                </section>
                <label>Overlay text</label>
                <textarea
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
