"use client";

import { useEffect, useState } from "react";

type ProgressProps = {
    progress: number;
    progressInterval?: number;
};

export function Progress({ progress, progressInterval = 900 }: ProgressProps) {
    const [currProgress, setCurrProgress] = useState(0);

    useEffect(() => {
        const step = Math.floor(progress / (progress <= 100 ? 20 : 10));
        const progressLoop = setInterval(() => {
            setCurrProgress((prev) =>
                increaseProgress(prev, step, progress, progressLoop),
            );
        }, progressInterval);

        return () => {
            clearInterval(progressLoop);
        };
    }, [progress, progressInterval]);

    return <span>{" " + currProgress}</span>;
}

function increaseProgress(
    currProgress: number,
    step: number,
    max: number,
    progressLoop: ReturnType<typeof setInterval>,
): number {
    step = currProgress < 100 ? Math.min(step, 10) : step;
    const next = currProgress + step;

    if (next > max) {
        clearInterval(progressLoop);
        return max;
    }

    return next;
}
