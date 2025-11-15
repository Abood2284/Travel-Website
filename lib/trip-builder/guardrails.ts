// lib/trip-builder/guardrails.ts
export const DESTINATIONS = [
  "Bali",
  "United States",
  "Dubai",
  "Thailand",
  "London",
  "France",
  "Japan",
  "Türkiye",
  "China",
  "Greece",
  "Germany",
  "Netherlands",
  "Saudi Arabia",
  "Vietnam",
  "Switzerland",
  "India",
  "Singapore",
  "South Africa",
  "Australia",
  "New Zealand",
] as const;

export const ORIGIN_CITIES = [
  "Mumbai, India",
  "Delhi, India",
  "Bangalore, India",
  "Chennai, India",
  "Kolkata, India",
  "Hyderabad, India",
  "Pune, India",
  "Ahmedabad, India",
  "New York, USA",
  "London, UK",
  "Dubai, UAE",
  "Singapore, Singapore",
] as const;

export const NATIONALITIES = [
  "Indian",
  "NRI",
  "South Asian",
  "American",
  "Other",
] as const;

export const AIRLINES = [
  "Any",
  "IndiGo",
  "Air India",
  "Emirates",
  "Qatar Airways",
  "Vistara",
] as const;

export const ROOMS = [
  "King Bed",
  "Twin Beds",
  "Connecting Rooms",
  "High Floor",
  "Non-Smoking",
  "Accessible",
  "Sea View",
] as const;

export const ACTIVITIES = [
  "City Tour",
  "Museum Visit",
  "Temple Tour",
  "Beach Day",
  "Desert Safari",
  "Island Hopping",
  "Mountain Hiking",
  "Cultural Experience",
  "Food Tour",
  "Shopping",
  "Theme Park",
  "Wildlife Safari",
  "Scuba Diving",
  "Scenic Train Ride",
  "Wine Tasting",
] as const;

export const HOTEL_PREFERENCES = ["3 Star", "4 Star", "5 Star"] as const;

export const FLIGHT_CLASSES = ["Economy", "Business", "First"] as const;

export const VISA_STATUS = ["Available", "N/A"] as const;

// Tiny fact blurbs used for small talk.
// Keep these brand-safe and non-claimy.
const FACTS: Record<string, string> = {
  "Bali": "Beach + rice terraces. Photogenic to a rude degree.",
  "United States": "Coast-to-coast variety: cities, parks, beaches.",
  "Dubai": "Desert meets skyscrapers; family-friendly and easy to plan.",
  "Thailand": "Temples by day, markets by night. Great value.",
  "London": "Historic landmarks, museums, theatre and diverse neighbourhoods.",
  "France": "World-class art, cuisine, vineyards and coastal regions.",
  "Japan": "Ancient traditions meet cutting-edge modern culture.",
  "Türkiye": "Bridges Europe and Asia with rich history and unique landscapes.",
  "China": "Vast country with dynastic history and iconic landmarks.",
  "Greece": "Ancient ruins, islands and Mediterranean cuisine.",
  "Germany": "Historic cities, alpine scenery and strong traditions.",
  "Netherlands": "Canals, cycling, tulips and compact, walkable cities.",
  "Saudi Arabia": "Historic sites, Red Sea coastlines and desert landscapes.",
  "Vietnam": "Rice terraces to vibrant cities and tropical coasts.",
  "Switzerland": "The Alps, lakes, scenic rail and refined cuisine.",
  "India": "Vast cultural diversity, historic sites and varied landscapes.",
  "Singapore": "Compact, spotless, wildly efficient. Food courts are elite.",
  "South Africa": "Safaris, dramatic coastlines and vibrant cities.",
  "Australia": "Reefs, coasts, Outback and cosmopolitan cities.",
  "New Zealand": "Fjords, mountains and compact, dramatic scenery.",
};

export function niceFact(dest?: string) {
  return dest && FACTS[dest] ? FACTS[dest] : "Solid choice. Easy planning.";
}

export function whereIs(dest?: string) {
  return dest
    ? `${dest} is a popular, well-connected destination with plenty of family-friendly options.`
    : "A well-connected destination with straightforward planning.";
}
