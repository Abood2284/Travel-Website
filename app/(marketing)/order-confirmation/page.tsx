import { and, eq } from "drizzle-orm";

import { DESTINATIONS } from "@/lib/const";
import { db } from "@/lib/db";
import { activities, tripRequestActivities } from "@/lib/db/schema";
import { getTripRequestById } from "@/lib/db/queries/trip-requests";

import OrderConfirmationClient from "./OrderConfirmationClient";

type OrderConfirmationPageProps = {
  searchParams?: Promise<{ tripRequestId?: string; destinationId?: string }>;
};

type TripSummary = {
  fromCity: string;
  toCity: string;
  departDate?: string;
  returnDate?: string;
  passengerName: string;
  visaStatus: string;
  adults: number;
  children: number;
  airline: string;
  nationality: string;
  hotelPref: string;
  flightClass: string;
};

const IATA: Record<string, string> = {
  "Abu Dhabi": "AUH",
  "Addis Ababa": "ADD",
  "Agra": "AGR",
  Amsterdam: "AMS",
  "Baku": "GYD",
  Bangalore: "BLR",
  Bangkok: "BKK",
  Barcelona: "BCN",
  "Buenos Aires": "EZE",
  "Cairo": "CAI",
  "Cape Town": "CPT",
  Chicago: "ORD",
  "Copenhagen": "CPH",
  Doha: "DOH",
  Dubai: "DXB",
  Dublin: "DUB",
  "Frankfurt": "FRA",
  "Ho Chi Minh City": "SGN",
  Honolulu: "HNL",
  Istanbul: "IST",
  Jakarta: "CGK",
  "Johannesburg": "JNB",
  London: "LHR",
  Madrid: "MAD",
  Maldives: "MLE",
  Manila: "MNL",
  Mumbai: "BOM",
  Nairobi: "NBO",
  "New Delhi": "DEL",
  Osaka: "KIX",
  Paris: "CDG",
  Rome: "FCO",
  "San Francisco": "SFO",
  Singapore: "SIN",
  Sydney: "SYD",
  Tokyo: "HND",
};

const DESTINATION_LABEL_TO_ID = DESTINATIONS.reduce<Record<string, string>>((acc, dest) => {
  const fullLabel = `${dest.name}, ${dest.country}`.toLowerCase();
  acc[fullLabel] = dest.id;
  acc[dest.name.toLowerCase()] = dest.id;
  return acc;
}, {});

function iataFor(label?: string) {
  const value = (label || "").trim();
  if (!value) return "—";
  if (/^your\b/i.test(value) || /location|city|custom/i.test(value) || /^you$/i.test(value)) {
    return "—";
  }
  if (IATA[value]) return IATA[value];
  return value
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
}

function destinationSlugFromLabel(label?: string) {
  if (!label) return undefined;
  const normalized = label.toLowerCase().trim();
  if (DESTINATION_LABEL_TO_ID[normalized]) return DESTINATION_LABEL_TO_ID[normalized];
  const [city, country] = normalized.split(",").map((part) => part.trim());
  if (city && country) {
    const recomposed = `${city}, ${country}`;
    if (DESTINATION_LABEL_TO_ID[recomposed]) return DESTINATION_LABEL_TO_ID[recomposed];
  }
  return undefined;
}

function formatPassengerName(fullName?: string) {
  const name = (fullName || "").trim();
  if (!name) return "GUEST";
  const firstSpace = name.indexOf(" ");
  if (firstSpace < 0) return name;
  const first = name.slice(0, firstSpace);
  let index = firstSpace + 1;
  while (index < name.length && name[index] === " ") index++;
  const initial = index < name.length ? name[index].toUpperCase() : "";
  if (!initial) return first;
  return `${first} ${initial}.`;
}

function toIsoDate(value?: string | Date | null) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function formatPrice(raw: string | number | null, currency: string) {
  const numericValue = typeof raw === "number" ? raw : Number(raw ?? 0);
  if (!Number.isFinite(numericValue)) {
    return `${raw ?? ""} ${currency}`.trim();
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${numericValue.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} ${currency}`;
  }
}

async function buildTripSummary(tripRequestId: string | null) {
  if (!tripRequestId) return { summary: null, destinationId: null, tripRequest: null };
  const tripRequest = await getTripRequestById(tripRequestId);
  if (!tripRequest) {
    return { summary: null, destinationId: null, tripRequest: null };
  }

  const summary: TripSummary = {
    fromCity: tripRequest.origin,
    toCity: tripRequest.destination,
    departDate: toIsoDate(tripRequest.startDate),
    returnDate: toIsoDate(tripRequest.endDate),
    passengerName: formatPassengerName(tripRequest.passengerName),
    visaStatus: tripRequest.visaStatus,
    adults: tripRequest.adults,
    children: tripRequest.kids,
    airline: tripRequest.airlinePreference,
    nationality: tripRequest.nationality,
    hotelPref: tripRequest.hotelPreference,
    flightClass: tripRequest.flightClass,
  };

  const derivedDestination = destinationSlugFromLabel(tripRequest.destination);

  return {
    summary,
    destinationId: derivedDestination,
    tripRequest,
  };
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : null;

  const tripRequestId =
    typeof resolvedSearchParams?.tripRequestId === "string" &&
    resolvedSearchParams.tripRequestId.length > 0
      ? resolvedSearchParams.tripRequestId
      : null;

  const destinationIdFromParams =
    typeof resolvedSearchParams?.destinationId === "string" &&
    resolvedSearchParams.destinationId.length > 0
      ? resolvedSearchParams.destinationId
      : null;

  const { summary, destinationId: derivedDestinationId, tripRequest } =
    await buildTripSummary(tripRequestId);

  const destinationId =
    destinationIdFromParams ??
    derivedDestinationId ??
    (DESTINATIONS.length > 0 ? DESTINATIONS[0]?.id : null);

  const destinationMeta = destinationId
    ? DESTINATIONS.find((destination) => destination.id === destinationId) ?? null
    : null;

  const activeActivities = destinationMeta
    ? await db
        .select()
        .from(activities)
        .where(and(eq(activities.destinationId, destinationMeta.id), eq(activities.isActive, true)))
        .orderBy(activities.name)
    : [];

  const addedActivities = tripRequestId
    ? await db
        .select({ activityId: tripRequestActivities.activityId })
        .from(tripRequestActivities)
        .where(eq(tripRequestActivities.tripRequestId, tripRequestId))
    : [];
  const addedActivitySet = new Set(addedActivities.map((entry) => entry.activityId));

  const boardingPassProps = summary ?? {
    fromCity: "Your City",
    toCity: destinationMeta ? `${destinationMeta.name}, ${destinationMeta.country}` : "Your Destination",
    departDate: undefined,
    returnDate: undefined,
    passengerName: "GUEST",
    visaStatus: "Pending",
    adults: 1,
    children: 0,
    airline: "—",
    nationality: "—",
    hotelPref: "3 Star",
    flightClass: "Economy",
  };

  const firstName = tripRequest?.passengerName?.split(" ")[0] ?? "Explorer";
  const destinationLabel = tripRequest?.destination ?? destinationMeta?.name ?? "your destination";
  const referenceShort = tripRequest?.id ? tripRequest.id.split("-")[0].toUpperCase() : null;

  const activitiesForClient = activeActivities.map((activity) => ({
    id: activity.id,
    name: activity.name,
    description: activity.description,
    priceLabel: formatPrice(activity.price, activity.currency),
    reviewCount: activity.reviewCount,
    imageUrl: activity.imageUrl,
    added: addedActivitySet.has(activity.id),
  }));

  return (
    <OrderConfirmationClient
      firstName={firstName}
      destinationLabel={destinationLabel}
      referenceShort={referenceShort}
      boardingPass={{
        ...boardingPassProps,
        iataFrom: iataFor(boardingPassProps.fromCity),
        iataTo: iataFor(boardingPassProps.toCity),
      }}
      destination={
        destinationMeta
          ? { id: destinationMeta.id, name: destinationMeta.name, country: destinationMeta.country }
          : null
      }
      activities={activitiesForClient}
      tripRequestId={tripRequestId}
    />
  );
}
