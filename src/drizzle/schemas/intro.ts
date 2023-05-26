import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const intro = sqliteTable("intro", {
    id: integer("id").primaryKey(),
    mainMessage: text("main_message").notNull().default(""),
    preMessage: text("pre_message").notNull().default(""),
    symbol: text("symbol").notNull().default(""),
    progress: text("progress").notNull().default(""),
});

export const insertIntroSchema = createInsertSchema(intro);
export const selectIntroSchema = createSelectSchema(intro);
