CREATE TABLE "trip_request_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_request_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip_request_activities" ADD CONSTRAINT "trip_request_activities_trip_request_id_trip_requests_id_fk" FOREIGN KEY ("trip_request_id") REFERENCES "public"."trip_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_request_activities" ADD CONSTRAINT "trip_request_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tra_trip_idx" ON "trip_request_activities" USING btree ("trip_request_id");--> statement-breakpoint
CREATE INDEX "tra_activity_idx" ON "trip_request_activities" USING btree ("activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tra_trip_activity_unique" ON "trip_request_activities" USING btree ("trip_request_id","activity_id");