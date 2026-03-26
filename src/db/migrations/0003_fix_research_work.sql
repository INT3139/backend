ALTER TABLE "profile_research_works" ADD COLUMN "project_code" text;--> statement-breakpoint
ALTER TABLE "profile_research_works" ADD COLUMN "extra" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_research_type" ON "profile_research_works" USING btree ("profile_id","work_type");--> statement-breakpoint
CREATE INDEX "idx_research_project_code" ON "profile_research_works" USING btree ("project_code") WHERE project_code IS NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_research_works" DROP COLUMN "note";--> statement-breakpoint
ALTER TABLE "profile_research_works" DROP COLUMN "origin";
