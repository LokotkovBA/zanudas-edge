import { modifierArray } from "../schedule";
import { type ArrayElement } from "./helpers";

export type EventEntry = {
    id: number;
    startDate: Date;
    endDate: Date;
    title: string;
    description: string;
    modifier: EventModifier;
};

export type EventModifier = ArrayElement<typeof modifierArray>;

export function isEventModifier(value: string): value is EventModifier {
    return modifierArray.includes(value as EventModifier); // HACK: prevents a dumb error
}
