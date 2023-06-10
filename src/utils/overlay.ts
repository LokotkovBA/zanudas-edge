import { type OverlayQueueEntry } from "./types/overlay";

export function filterMaxDisplay(
    maxDisplay: number,
    queueEntries?: OverlayQueueEntry[],
    oldCurrent?: number,
) {
    if (!queueEntries) {
        return [];
    }
    let current = 0;
    if (oldCurrent !== undefined) {
        current = oldCurrent - 1;
    } else {
        for (const entry of queueEntries) {
            if (entry.current === 1) {
                break;
            }
            current++;
        }
    }

    let min = current - Math.floor(maxDisplay / 2);
    min =
        queueEntries.length - min - 1 >= maxDisplay
            ? min
            : queueEntries.length - maxDisplay;

    let displayed = 0;
    const out: typeof queueEntries = [];

    let index = 0;
    for (const entry of queueEntries) {
        if (min <= index) {
            displayed++;
            entry.queueNumber = index;
            out.push(entry);
        }

        index++;
        if (displayed === maxDisplay) {
            break;
        }
    }
    return out;
}
