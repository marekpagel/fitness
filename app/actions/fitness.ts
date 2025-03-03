"use server";

import { db } from "../../db/config";
import { participants, scores } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function getParticipants() {
  return await db.select().from(participants);
}

export async function addParticipant(name: string) {
  return await db.insert(participants).values({ name }).returning();
}

export async function deleteParticipant(id: number) {
  // Delete scores first due to foreign key constraint
  await db.delete(scores).where(eq(scores.participantId, id));
  return await db.delete(participants).where(eq(participants.id, id));
}

export async function addScore(
  participantId: number,
  score: number,
  dateStr: string
) {
  return await db
    .insert(scores)
    .values({
      participantId,
      score,
      date: dateStr,
    })
    .returning();
}

export async function getScores(participantId?: number) {
  const query = db.select().from(scores);
  if (participantId) {
    return await query.where(eq(scores.participantId, participantId));
  }
  return await query;
}
