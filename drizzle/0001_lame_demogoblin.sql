CREATE TYPE "public"."event" AS ENUM('pushup_60s', 'pullup_max');--> statement-breakpoint
ALTER TABLE "scores" RENAME TO "score";--> statement-breakpoint
ALTER TABLE "score" DROP CONSTRAINT "scores_participant_id_participants_id_fk";
--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "score" ADD COLUMN "event" "event" NOT NULL;--> statement-breakpoint
ALTER TABLE "score" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "score" ADD CONSTRAINT "score_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_uidx" ON "participants" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_event_date_uidx" ON "score" USING btree ("participant_id","event","date");--> statement-breakpoint
CREATE INDEX "event_date_idx" ON "score" USING btree ("event","date");