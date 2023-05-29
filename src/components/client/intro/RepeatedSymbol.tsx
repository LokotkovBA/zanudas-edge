"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

type RepeatedSymbolProps = {
    symbol: string;
    symbolInterval?: number;
};

export function RepeatedSymbol({
    symbol,
    symbolInterval = 1000,
}: RepeatedSymbolProps) {
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

function toggleSymbolState(prevState: number): number {
    return prevState === 3 ? 0 : prevState + 1;
}
