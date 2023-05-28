"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

type IntroOverlayProps = {
    introData: {
        symbol: string;
        progress: number | null;
        id: number;
        mainMessage: string;
        preMessage: string;
    }[];
};

function toggleSymbolState(prevState: number): number {
    return prevState === 3 ? 0 : prevState + 1;
}

function RepeatedSymbol({
    symbol,
    symbolInterval = 1000,
}: {
    symbol: string;
    symbolInterval?: number;
}) {
    const [symbolState, setSymbolState] = useState(0);
    useEffect(() => {
        const symbolLoop = setInterval(() => {
            setSymbolState(toggleSymbolState);
        }, symbolInterval);

        return () => {
            clearInterval(symbolLoop);
        };
    }, [symbolInterval]);

    return (
        <>
            <span
                className={clsx({
                    "opacity-0": symbolState <= 0,
                    "opacity-100": symbolState > 0,
                })}
            >
                {symbol}
            </span>
            <span
                className={clsx({
                    "opacity-0": symbolState <= 1,
                    "opacity-100": symbolState > 1,
                })}
            >
                {symbol}
            </span>
            <span
                className={clsx({
                    "opacity-0": symbolState <= 2,
                    "opacity-100": symbolState > 2,
                })}
            >
                {symbol}
            </span>
        </>
    );
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function IntroOverlay({ introData }: IntroOverlayProps) {
    const [position, setPosition] = useState(0);
    const introArrayRef = useRef(introData);
    const buffArrayRef = useRef<typeof introData>([]);
    const [message, setMessage] = useState("Ну ты и {говно} кодер {вот}");
    const [symbol, setSymbol] = useState(introData[0]?.symbol ?? "");

    useEffect(() => {
        const mainLoop = setInterval(async () => {
            setPosition(-1);
            await sleep(500);
            setPosition(1);
            if (!introArrayRef.current.length) {
                introArrayRef.current = buffArrayRef.current;
                buffArrayRef.current = [];
            }
            const currIndex = getRandomInt(introArrayRef.current.length);
            let currEntry = introArrayRef.current.splice(currIndex, 1)[0];
            if (!currEntry) {
                currEntry = {
                    id: -1,
                    mainMessage: "Что-то пошло не так",
                    preMessage: "",
                    symbol: "",
                    progress: null,
                };
            }

            buffArrayRef.current.push(currEntry);
            await sleep(500);
            setPosition(0);
            setSymbol(currEntry.symbol);
            if (currEntry.preMessage) {
                setMessage(currEntry.preMessage);
                await sleep(3000);
                setSymbol("");
            }
            setMessage(currEntry.mainMessage);
        }, 19000);

        return () => {
            clearInterval(mainLoop);
        };
    }, [introData, setSymbol]);

    return (
        <h1
            className={clsx("transition-transform ease-in-out", {
                "translate-x-[100vw] opacity-0 duration-0": position === 1,
                "duration-500": position === 0,
                "-translate-x-[100vw] duration-500": position === -1,
            })}
        >
            {parseMessage(message).map(
                ({ word, isEffect }, index, { length }) => (
                    <span
                        key={index}
                        className={clsx({
                            "animate-af text-transparent": isEffect,
                        })}
                    >
                        {word + (index === length - 1 ? "" : " ")}
                    </span>
                ),
            )}
            <RepeatedSymbol symbol={symbol} />
        </h1>
    );
}

function parseMessage(message: string): { word: string; isEffect: boolean }[] {
    const out: ReturnType<typeof parseMessage> = [];

    let prevEffect = false;
    for (let word of message.split(" ")) {
        let isEffect: boolean = prevEffect;
        if ((isEffect || word[0] === "{") && word[word.length - 1] === "}") {
            isEffect = true;
            word = word.slice(word[0] === "{" ? 1 : 0, -1);
            prevEffect = false;
        } else if (word[0] === "{") {
            isEffect = true;
            prevEffect = isEffect;
            word = word.slice(1);
        }

        out.push({ word, isEffect });
    }
    return out;
}
