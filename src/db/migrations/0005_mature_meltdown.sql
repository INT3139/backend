ALTER TABLE "profile_research_works" ALTER COLUMN "status" DROP DEFAULT, ALTER COLUMN "status" TYPE status USING status::status, ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "profile_research_works" ALTER COLUMN "status" SET NOT NULL;
