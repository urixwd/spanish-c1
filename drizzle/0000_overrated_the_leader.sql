CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"user_answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"ai_note" text,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"position" integer NOT NULL,
	"format" varchar(20) NOT NULL,
	"topic" varchar(50) NOT NULL,
	"stem" text NOT NULL,
	"options" jsonb,
	"correct_answer" text NOT NULL,
	"explanation" text NOT NULL,
	"question_data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"topic_mode" varchar(20) NOT NULL,
	"selected_topics" text[],
	"score" integer,
	"total" integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_answers_question_id" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_answers_is_correct" ON "answers" USING btree ("is_correct");--> statement-breakpoint
CREATE INDEX "idx_questions_session_id" ON "questions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_questions_topic" ON "questions" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "idx_sessions_started_at" ON "sessions" USING btree ("started_at");