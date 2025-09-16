// lib/trip-builder/types.ts
export type TripSeed = Partial<{
  from: string; // City, Country format
  destination: string; // City, Country format
  nationality: "Indian" | "NRI" | "Other South Asian" | "Other" | string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  days: number;
  adults: number;
  kids: number;
  airlinePref: string;
  hotelPref: string; // 3 Star, 4 Star, 5 Star
  flightClass: string; // Economy, Business, First
  visaStatus: string; // Available, N/A
  passengerName: string;
}>;

export type TripPayload = Required<{
  from: string; // City, Country format
  destination: string; // City, Country format
  nationality: string;
  startDate: string; // ISO
  endDate: string; // ISO
  days: number;
  nights: number;
  adults: number;
  kids: number;
  airlinePref: string;
  hotelPref: string;
  flightClass: string;
  visaStatus: string;
  passengerName: string;
}> & { createdAt: string };
