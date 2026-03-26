ALTER TABLE "sys_audit_logs" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "sys_audit_logs" ADD COLUMN "method" text;--> statement-breakpoint
ALTER TABLE "sys_audit_logs" ADD COLUMN "path" text;--> statement-breakpoint
ALTER TABLE "sys_audit_logs" ADD COLUMN "status_code" integer;