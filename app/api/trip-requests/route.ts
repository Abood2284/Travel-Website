import { NextResponse } from "next/server";

import { createTripRequest } from "@/lib/db/queries/trip-requests";
import type { TripStatus } from "@/lib/db/schema";

const REQUIRED_FIELDS = [
  "origin",
  "destination",
  "nationality",
  "startDate",
  "endDate",
  "adults",
  "kids",
  "airlinePreference",
  "hotelPreference",
  "flightClass",
  "visaStatus",
  "passengerName",
  "email",
  "phoneCountryCode",
  "phoneNumber",
] as const;

type TripRequestBody = {
  origin: string;
  destination: string;
  nationality: string;
  startDate: string;
  endDate: string;
  adults: number;
  kids: number;
  airlinePreference: string;
  hotelPreference: string;
  flightClass: string;
  visaStatus: string;
  passengerName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  status?: TripStatus;
};

function validate(body: Partial<TripRequestBody>): body is TripRequestBody {
  return REQUIRED_FIELDS.every((key) => {
    const value = body[key];
    if (typeof value === "number") return Number.isFinite(value);
    return typeof value === "string" && value.trim().length > 0;
  });
}

function parseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return date;
}

function formatDateToISODate(date: Date) {
  // Returns YYYY-MM-DD in UTC to match Postgres DATE
  return date.toISOString().slice(0, 10);
}

function normalizePhoneCode(code: string) {
  return code.replace(/\s+/g, "");
}

function normalizePhoneNumber(number: string) {
  return number.replace(/[^0-9+]/g, "");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<TripRequestBody>;
    console.info("[TripRequests API] Incoming payload", payload);

    if (!validate(payload)) {
      console.warn("[TripRequests API] Validation failed", payload);
      return NextResponse.json(
        { error: "Missing or invalid fields in trip request payload." },
        { status: 400 }
      );
    }

    const startDate = parseDate(payload.startDate);
    const endDate = parseDate(payload.endDate);

    if (startDate.getTime() > endDate.getTime()) {
      return NextResponse.json(
        { error: "Start date cannot be after end date." },
        { status: 400 }
      );
    }

    const startDateString = formatDateToISODate(startDate);
    const endDateString = formatDateToISODate(endDate);

    const adults = Number(payload.adults);
    const kids = Number(payload.kids);

    if (!Number.isFinite(adults) || adults <= 0) {
      return NextResponse.json(
        { error: "Adults must be a positive number." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(kids) || kids < 0) {
      return NextResponse.json(
        { error: "Children count cannot be negative." },
        { status: 400 }
      );
    }

    const phoneCountryCode = normalizePhoneCode(payload.phoneCountryCode);
    const phoneNumber = normalizePhoneNumber(payload.phoneNumber);

    const record = await createTripRequest({
      origin: payload.origin.trim(),
      destination: payload.destination.trim(),
      nationality: payload.nationality.trim(),
      startDate: startDateString,
      endDate: endDateString,
      adults,
      kids,
      airlinePreference: payload.airlinePreference.trim(),
      hotelPreference: payload.hotelPreference.trim(),
      flightClass: payload.flightClass.trim(),
      visaStatus: payload.visaStatus.trim(),
      passengerName: payload.passengerName.trim(),
      email: payload.email.trim(),
      phoneCountryCode,
      phoneNumber,
      status: payload.status ?? "new",
    });

    console.info("[TripRequests API] Created trip request", {
      id: record.id,
      createdAt: record.createdAt,
    });

    return NextResponse.json(
      { id: record.id, createdAt: record.createdAt },
      { status: 201 }
    );
  } catch (error) {
    console.error("[TripRequests API] Failed to create trip request", error);
    return NextResponse.json(
      { error: "Failed to create trip request." },
      { status: 500 }
    );
  }
}
