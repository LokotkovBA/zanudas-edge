import { type QueueEntry } from "~/drizzle/types";

export const emptyEntry: QueueEntry = {
    id: -1,
    artist: "",
    donorName: "",
    songName: "",
    tag: "",
    played: 0,
    current: 0,
    visible: 0,
    willAdd: 0,
    currency: "",
    donorText: "",
    likeCount: 0,
    queueNumber: -1,
    donateAmount: -1,
};
