import type { z } from "zod";
import type { insertSongsSchema } from "./schemas/songlist";

export type SonglistEntry = z.infer<typeof insertSongsSchema>;
