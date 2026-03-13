-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SEQUENCE "public"."pin_sequence" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "pins" (
	"pin_id" varchar(10) PRIMARY KEY NOT NULL,
	"case_id" uuid,
	"evidence_id" uuid,
	"pin_type" varchar(20),
	"timestamp_start" varchar(20),
	"timestamp_end" varchar(20),
	"incident_time" timestamp with time zone,
	"context" text,
	"importance" varchar(10) DEFAULT 'medium',
	"tagged_personas" uuid[] DEFAULT '{""}',
	"ai_context_data" jsonb DEFAULT '{}'::jsonb,
	"pinned_at" timestamp with time zone DEFAULT now(),
	"notes" text,
	"incident_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "persona_photos" (
	"photo_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"persona_id" uuid,
	"image_url" text NOT NULL,
	"twelve_labs_entity_id" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"persona_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"case_id" uuid,
	"first_name_th" varchar(100),
	"last_name_th" varchar(100),
	"first_name_en" varchar(100),
	"last_name_en" varchar(100),
	"aliases" jsonb DEFAULT '[]'::jsonb,
	"phones" jsonb DEFAULT '[]'::jsonb,
	"role" varchar(50) DEFAULT 'suspect',
	"distinctive_features" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"case_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"case_number" varchar(50),
	"title" varchar(200) NOT NULL,
	"narrative_report" text,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"case_narrative" text,
	"twelve_labs_index_id" text
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"evidence_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"case_id" uuid,
	"filename" varchar(255) NOT NULL,
	"display_name" varchar(200),
	"file_type" varchar(20),
	"blob_path" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"azure_analysis" jsonb,
	"twelve_labs_index_id" text,
	"uploaded_at" timestamp with time zone DEFAULT now(),
	"extracted_text" text,
	"twelve_labs_video_id" text,
	"indexing_task_id" text,
	"indexing_error" text
);
--> statement-breakpoint
ALTER TABLE "pins" ADD CONSTRAINT "pins_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("case_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pins" ADD CONSTRAINT "pins_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("evidence_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_photos" ADD CONSTRAINT "persona_photos_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("persona_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personas" ADD CONSTRAINT "personas_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("case_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("case_id") ON DELETE cascade ON UPDATE no action;
*/