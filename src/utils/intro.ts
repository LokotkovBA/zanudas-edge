import { type MessageFX } from "./types/intro";

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

export function parseMessage(message: string): MessageFX[] {
    const out: MessageFX[] = [];

    let isEffect = false;
    for (const stringPart of message.split(splitEffects)) {
        out.push({ stringPart, isEffect });
        isEffect = !isEffect;
    }

    return out;
}
