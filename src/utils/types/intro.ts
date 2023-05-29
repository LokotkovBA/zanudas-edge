export type IntroEntry = {
    symbol: string;
    progress: number | null;
    id: number;
    mainMessage: string;
    preMessage: string;
};

export type MessageFX = { stringPart: string; isEffect: boolean };
