import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  tripRequests,
  activities,
  tripRequestActivities,
} from "@/lib/db/schema";
import { DESTINATIONS } from "@/lib/const";

function destinationLabelToId(label: string | null) {
  if (!label) return undefined;
  const normalized = label.toLowerCase().trim();
  for (const item of DESTINATIONS) {
    if (
      normalized === item.id ||
      normalized === item.name.toLowerCase() ||
      normalized === `${item.name.toLowerCase()}, ${item.country.toLowerCase()}`
    ) {
      return item.id;
    }
  }
  return undefined;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripRequestId: string }> }
) {
  try {
    const { tripRequestId } = await params;
    const body = await request.json().catch(() => null);
    const activityId = typeof body?.activityId === "string" ? body.activityId : null;

    if (!tripRequestId || !activityId) {
      return NextResponse.json(
        { error: "tripRequestId and activityId are required" },
        { status: 400 }
      );
    }

    const [trip] = await db
      .select({ id: tripRequests.id, destination: tripRequests.destination })
      .from(tripRequests)
      .where(eq(tripRequests.id, tripRequestId))
      .limit(1);

    if (!trip) {
      return NextResponse.json({ error: "Trip request not found" }, { status: 404 });
    }

    const destinationSlug = destinationLabelToId(trip.destination ?? null);

    const [activity] = await db
      .select({ id: activities.id, destinationId: activities.destinationId, isActive: activities.isActive })
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);

    if (!activity || !activity.isActive) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    if (destinationSlug && activity.destinationId !== destinationSlug) {
      return NextResponse.json(
        { error: "Activity does not belong to the trip destination" },
        { status: 400 }
      );
    }

    await db
      .insert(tripRequestActivities)
      .values({ tripRequestId, activityId })
      .onConflictDoNothing();

    return NextResponse.json({ tripRequestId, activityId }, { status: 201 });
  } catch (error) {
    console.error("Add activity to trip failed", error);
    return NextResponse.json(
      { error: "Failed to add activity to trip" },
      { status: 500 }
    );
  }
}
