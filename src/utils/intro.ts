import { useEffect, useReducer, useRef, useState } from "react";
import { getRandomInt, sleep } from "./helpers";
import { type MessageFX, type IntroEntry } from "./types/intro";

const splitEffects = {
    [Symbol.split](str: string) {
        const result: string[] = [];
        let stringPart = "";

        for (const char of str) {
            switch (char) {
                case "{":
                    result.push(stringPart);
                    stringPart = "";
                    break;
                case "}":
                    result.push(stringPart);
                    stringPart = "";
                    break;
                default:
                    stringPart += char;
            }
        }
        if (stringPart.length) {
            result.push(stringPart);
        }

        return result;
    },
};

function parseMessage(message: string): MessageFX[] {
    const out: MessageFX[] = [];

    let isEffect = false;
    for (const stringPart of message.split(splitEffects)) {
        out.push({ stringPart, isEffect });
        isEffect = !isEffect;
    }

    return out;
}

const initialSplitMessage = [
    { stringPart: "РАЗВОРАЧИВАЕМ СПИСОК БУСТЕРОВ", isEffect: false },
];

function messageReducer(oldMessage: MessageFX[], newMessage: string) {
    return parseMessage(newMessage);
}

export function useIntro(introData: IntroEntry[]) {
    const [position, setPosition] = useState(0);
    const [symbol, setSymbol] = useState(".");
    const [progress, setProgress] = useState<number | null>(null);

    const introArrayRef = useRef(introData);
    const buffArrayRef = useRef<IntroEntry[]>([]);

    const [splitMessage, setSplitMessage] = useReducer(
        messageReducer,
        initialSplitMessage,
    );

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

            await sleep(50);
            setPosition(0);
            setSymbol(currEntry.symbol);
            setProgress(currEntry.progress);

            if (currEntry.preMessage) {
                setSplitMessage(currEntry.preMessage);
                await sleep(10000);
                setSymbol("");
            }

            setSplitMessage(currEntry.mainMessage);
        }, 20000);

        return () => {
            clearInterval(mainLoop);
        };
    }, [introData, setSymbol]);

    return [position, splitMessage, symbol, progress] as const;
}
