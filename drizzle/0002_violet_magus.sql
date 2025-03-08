ALTER TABLE "participants" RENAME TO "participant";--> statement-breakpoint
ALTER TABLE "score" DROP CONSTRAINT "score_participant_id_participants_id_fk";
--> statement-breakpoint
ALTER TABLE "score" ADD CONSTRAINT "score_participant_id_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participant"("id") ON DELETE no action ON UPDATE no action;