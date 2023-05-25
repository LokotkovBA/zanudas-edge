import { z } from "zod";
import type { insertSongsSchema } from "./schemas/songlist";
import type { selectLikesSchema, selectQueueSchema } from "./schemas/queue";

export type Song = z.infer<typeof insertSongsSchema>;
export type QueueEntry = z.infer<typeof selectQueueSchema>;
export type LikeEntry = z.infer<typeof selectLikesSchema>;

export type ChangedQueueEntry = z.infer<typeof changedQueueEntrySchema>;
export const changedQueueEntrySchema = z.object({
    id: z.number(),
    artist: z.string().optional(),
    songName: z.string().optional(),
    tag: z.string().optional(),
    donorName: z.string().optional(),
    donateAmount: z.number().optional(),
    donorText: z.string().optional(),
    currency: z.string().optional(),
    willAdd: z.number().optional(),
    current: z.number().optional(),
    visible: z.number().optional(),
    played: z.number().optional(),
});
