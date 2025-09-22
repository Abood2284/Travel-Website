CREATE TYPE "public"."trip_status" AS ENUM('new', 'contacted', 'quoted', 'closed', 'archived');--> statement-breakpoint
CREATE TABLE "trip_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origin" varchar(160) NOT NULL,
	"destination" varchar(160) NOT NULL,
	"nationality" varchar(120) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"adults" integer DEFAULT 1 NOT NULL,
	"kids" integer DEFAULT 0 NOT NULL,
	"airline_preference" varchar(120) NOT NULL,
	"hotel_preference" varchar(120) NOT NULL,
	"flight_class" varchar(60) NOT NULL,
	"visa_status" varchar(60) NOT NULL,
	"passenger_name" varchar(180) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_country_code" varchar(8) NOT NULL,
	"phone_number" varchar(32) NOT NULL,
	"status" "trip_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
