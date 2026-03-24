DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'research_work_type') THEN
        CREATE TYPE "public"."research_work_type" AS ENUM('journal_paper', 'conference_paper', 'book', 'book_chapter', 'patent', 'software', 'other');
    END IF;
END $$;--> statement-breakpoint
ALTER TABLE "profile_research_works" ALTER COLUMN "work_type" SET DATA TYPE research_work_type USING work_type::research_work_type;--> statement-breakpoint
ALTER TABLE "profile_research_works" ADD COLUMN "avatar_default" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_research_works" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "profile_research_works" ADD COLUMN "origin" text;--> statement-breakpoint
ALTER TABLE "profile_research_works" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_research_works" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profile_staff" ADD COLUMN "avatar_default" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_staff" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "profile_staff" ADD COLUMN "origin" text;--> statement-breakpoint
ALTER TABLE "wf_instances" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;