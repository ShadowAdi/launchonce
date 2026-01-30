CREATE TYPE "public"."form_field_type" AS ENUM('short_text', 'long_text', 'select', 'boolean', 'email', 'url');--> statement-breakpoint
CREATE TABLE "form_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"label" varchar(225) NOT NULL,
	"description" text,
	"type" "form_field_type" NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"options" jsonb,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"title" varchar(225) NOT NULL,
	"description" text,
	"list_responses_publicly" boolean DEFAULT false,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "forms_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
ALTER TABLE "translations" DROP CONSTRAINT "translations_document_id_docuements_id_fk";
--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "translated_blocks" text;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_document_id_docuements_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."docuements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "form_answers_response_field_unique" ON "form_answers" USING btree ("response_id","field_id");--> statement-breakpoint
CREATE INDEX "form_answers_response_idx" ON "form_answers" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "form_fields_form_order_idx" ON "form_fields" USING btree ("form_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "form_fields_form_order_unique" ON "form_fields" USING btree ("form_id","order");--> statement-breakpoint
CREATE INDEX "form_responses_form_public_idx" ON "form_responses" USING btree ("form_id","is_public");--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_document_id_docuements_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."docuements"("id") ON DELETE cascade ON UPDATE no action;