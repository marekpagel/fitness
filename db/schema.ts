import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id")
    .references(() => participants.id)
    .notNull(),
  score: integer("score").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
