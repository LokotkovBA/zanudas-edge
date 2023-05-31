import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const events = sqliteTable("events", {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    modifier: text("modifier").notNull().default("Game"),
    startTimestamp: integer("start_timestamp").notNull(),
    endTimestamp: integer("end_timestamp").notNull(),
});

export const insertEventsSchema = createInsertSchema(events);
export const selectEventsSchema = createSelectSchema(events);
