"use server";

import { db } from "../../db/config";
import { participant, score } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function getParticipants() {
  return await db.select().from(participant);
}

export async function addParticipant(name: string, email: string) {
  return await db.insert(participant).values({ name, email }).returning();
}

export async function deleteParticipant(id: number) {
  // Delete scores first due to foreign key constraint
  await db.delete(score).where(eq(score.participantId, id));
  return await db.delete(participant).where(eq(participant.id, id));
}

export async function addScore(
  participantId: number,
  event: "pushup_60s" | "pullup_max",
  score_value: number,
  date: string
) {
  // Check if score exists for this participant, event, and date
  const existingScore = await db
    .select()
    .from(score)
    .where(
      and(
        eq(score.participantId, participantId),
        eq(score.event, event),
        eq(score.date, sql`${date}::date`)
      )
    );

  if (existingScore.length > 0) {
    // Update existing score
    return await db
      .update(score)
      .set({
        score: score_value,
        updatedAt: new Date(),
      })
      .where(eq(score.id, existingScore[0].id))
      .returning();
  }

  // Insert new score
  return await db
    .insert(score)
    .values({
      participantId,
      event,
      score: score_value,
      date: sql`${date}::date`,
    })
    .returning();
}

export async function getScores(participantId?: number) {
  const baseQuery = db.select().from(score);
  if (participantId) {
    return await baseQuery.where(eq(score.participantId, participantId));
  }
  return await baseQuery;
}
