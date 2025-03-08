import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

const timeStamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const participant = pgTable(
  "participants",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    ...timeStamps,
  },
  (table) => ({ emailUidx: uniqueIndex("email_uidx").on(table.email) })
);

export const eventEnum = pgEnum("event", ["pushup_60s", "pullup_max"]);

export const score = pgTable(
  "score",
  {
    id: serial("id").primaryKey(),
    participantId: integer("participant_id")
      .references(() => participant.id)
      .notNull(),
    event: eventEnum("event").notNull(),
    score: integer("score").notNull(),
    date: date("date").notNull(),
    ...timeStamps,
  },
  (table) => [
    uniqueIndex("participant_event_date_uidx").on(
      table.participantId,
      table.event,
      table.date
    ),
    index("event_date_idx").on(table.event, table.date),
  ]
);
