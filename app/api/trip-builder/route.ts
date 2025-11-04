import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { tripRequests, tripRequestActivities } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripData, activityIds } = body;

    // Validate required fields
    if (!tripData || !activityIds || activityIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert trip request
    const [tripRequest] = await db
      .insert(tripRequests)
      .values({
        origin: tripData.origin,
        destination: tripData.destination,
        nationality: tripData.nationality,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        adults: parseInt(tripData.adults),
        kids: parseInt(tripData.kids),
        airlinePreference: tripData.airlinePreference,
        hotelPreference: tripData.hotelPreference,
        flightClass: tripData.flightClass,
        visaStatus: tripData.visaStatus,
        passengerName: tripData.passengerName,
        email: tripData.email,
        phoneCountryCode: tripData.phoneCountryCode,
        phoneNumber: tripData.phoneNumber,
        status: "new",
      })
      .returning();

    // Insert trip request activities
    const activityRecords = activityIds.map((activityId: string) => ({
      tripRequestId: tripRequest.id,
      activityId: activityId,
    }));

    await db.insert(tripRequestActivities).values(activityRecords);

    return NextResponse.json({
      success: true,
      tripRequestId: tripRequest.id,
      message: "Trip request created successfully",
    });
  } catch (error) {
    console.error("Error creating trip request:", error);
    return NextResponse.json(
      { error: "Failed to create trip request" },
      { status: 500 }
    );
  }
}
