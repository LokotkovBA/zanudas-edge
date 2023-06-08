"use client";

import clsx from "clsx";
import { RepeatedSymbol } from "./RepeatedSymbol";
import { Progress } from "./Progress";
import { type IntroEntry } from "~/utils/types/intro";
import { useIntro } from "./hooks/useIntro";

type IntroOverlayProps = {
    introData: IntroEntry[];
};

export function IntroOverlay({ introData }: IntroOverlayProps) {
    const [position, splitMessage, symbol, progress] = useIntro(introData);

    return (
        <h1
            className={clsx("transition-transform ease-in-out", {
                "translate-x-[100vw] opacity-0 duration-0": position === 1,
                "duration-500": position === 0,
                "-translate-x-[100vw] duration-500": position === -1,
            })}
        >
            {splitMessage.map(({ stringPart, isEffect }, index) => (
                <span
                    key={index}
                    className={clsx({
                        "animate-af text-transparent": isEffect,
                    })}
                >
                    {stringPart}
                </span>
            ))}
            <RepeatedSymbol symbol={symbol} />
            {progress && <Progress progress={progress} />}
        </h1>
    );
}
