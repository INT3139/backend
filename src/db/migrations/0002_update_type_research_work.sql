ALTER TABLE "public"."profile_research_works" ALTER COLUMN "work_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."research_work_type";--> statement-breakpoint
CREATE TYPE "public"."research_work_type" AS ENUM('research_project', 'book', 'training_product', 'research_product', 'patent', 'journal_paper', 'conference_paper', 'book_chapter', 'other');--> statement-breakpoint
ALTER TABLE "public"."profile_research_works" ALTER COLUMN "work_type" SET DATA TYPE "public"."research_work_type" USING "work_type"::"public"."research_work_type";