CREATE TYPE "public"."alert_frequency" AS ENUM('instant', 'daily', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."application_method" AS ENUM('internal', 'external', 'email');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('draft', 'submitted', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."eligibility" AS ENUM('students', 'graduates', 'both');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('new', 'read', 'replied', 'archived');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('draft', 'pending', 'published', 'closed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('internship', 'siwes', 'graduate', 'remote_internship', 'volunteer', 'entry_level');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'reviewing', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'company', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('remote', 'onsite', 'hybrid');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"keywords" text,
	"field_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"locations" text[] DEFAULT '{}'::text[] NOT NULL,
	"types" text[] DEFAULT '{}'::text[] NOT NULL,
	"work_modes" text[] DEFAULT '{}'::text[] NOT NULL,
	"frequency" "alert_frequency" DEFAULT 'weekly' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"status" "application_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"school" text,
	"course" text,
	"level" text,
	"cover_letter" text,
	"cv_url" text,
	"cv_name" text,
	"cover_letter_url" text,
	"cover_letter_name" text,
	"portfolio_url" text,
	"status" "application_status" DEFAULT 'draft' NOT NULL,
	"company_note" text,
	"step" integer DEFAULT 1 NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"owner_id" uuid,
	"logo_url" text,
	"brand_color" text DEFAULT '#111827' NOT NULL,
	"cover_url" text,
	"tagline" text,
	"description" text,
	"industry" text,
	"location" text,
	"website" text,
	"email" text,
	"phone" text,
	"size" text,
	"founded_year" integer,
	"verified" boolean DEFAULT false NOT NULL,
	"status" "company_status" DEFAULT 'pending' NOT NULL,
	"socials" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"status" "message_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT 'briefcase' NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"company_id" uuid NOT NULL,
	"field_id" uuid,
	"type" "opportunity_type" DEFAULT 'internship' NOT NULL,
	"work_mode" "work_mode" DEFAULT 'onsite' NOT NULL,
	"location" text NOT NULL,
	"stipend" integer,
	"paid" boolean DEFAULT true NOT NULL,
	"duration_months" integer,
	"eligibility" "eligibility" DEFAULT 'students' NOT NULL,
	"summary" text,
	"description" text NOT NULL,
	"requirements" text[] DEFAULT '{}'::text[] NOT NULL,
	"learnings" text[] DEFAULT '{}'::text[] NOT NULL,
	"responsibilities" text[] DEFAULT '{}'::text[] NOT NULL,
	"benefits" text[] DEFAULT '{}'::text[] NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"application_method" "application_method" DEFAULT 'internal' NOT NULL,
	"external_url" text,
	"application_email" text,
	"require_cover_letter" boolean DEFAULT false NOT NULL,
	"deadline" date,
	"start_date" date,
	"openings" integer DEFAULT 1 NOT NULL,
	"status" "opportunity_status" DEFAULT 'pending' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"rejection_reason" text,
	"posted_by_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid,
	"reporter_id" uuid,
	"email" text,
	"reason" text NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"cover_url" text,
	"read_minutes" integer DEFAULT 5 NOT NULL,
	"author_name" text DEFAULT 'Internly Team' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_opportunities" (
	"user_id" uuid NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_opportunities_user_id_opportunity_id_pk" PRIMARY KEY("user_id","opportunity_id")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"headline" text,
	"school" text,
	"course" text,
	"level" text,
	"location" text,
	"bio" text,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"interests" text[] DEFAULT '{}'::text[] NOT NULL,
	"experience" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"projects" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cv_url" text,
	"cv_name" text,
	"notification_prefs" jsonb DEFAULT '{"emailAlerts":true,"applicationUpdates":true,"newsletter":false}'::jsonb NOT NULL,
	"profile_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"avatar_url" text,
	"phone" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_posted_by_id_users_id_fk" FOREIGN KEY ("posted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "applications_unique_idx" ON "applications" USING btree ("opportunity_id","user_id");--> statement-breakpoint
CREATE INDEX "applications_user_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_slug_idx" ON "companies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "companies_owner_idx" ON "companies" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fields_slug_idx" ON "fields" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "opportunities_slug_idx" ON "opportunities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "opportunities_company_idx" ON "opportunities" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "opportunities_status_idx" ON "opportunities" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree (lower("email"));