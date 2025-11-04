// lib/destination-data.ts
export interface DestinationInfo {
  id: string;
  name: string;
  country: string;
  description: string;
  heroImage: string;
  highlights: string[];
  destinationHighlights: {
    category: string;
    items: string[];
  }[];
  suitedFor: {
    type: string;
    description: string;
  }[];
  bestTimeToVisit: string;
  currency: string;
  language: string;
}

export const DESTINATION_DATA: Record<string, DestinationInfo> = {
  dubai: {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    description:
      "Dubai is a dazzling metropolis in the United Arab Emirates, known for its ultramodern architecture, luxury shopping, and vibrant nightlife scene. From the iconic Burj Khalifa to the traditional souks, Dubai offers a unique blend of innovation and heritage.",
    heroImage: "/images/destinations/dubai-hero.jpg",
    highlights: [
      "World's tallest building - Burj Khalifa",
      "Luxury shopping at Dubai Mall",
      "Palm Jumeirah artificial island",
      "Traditional gold and spice souks",
      "Desert safaris and dune bashing",
      "World-class dining experiences",
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Burj Khalifa", "Burj Al Arab", "Museum of the Future"],
      },
      {
        category: "Shopping",
        items: ["Dubai Mall", "Mall of the Emirates", "Gold Souk"],
      },
      {
        category: "Entertainment",
        items: ["Dubai Fountain", "IMG Worlds", "Ski Dubai"],
      },
      {
        category: "Culture",
        items: ["Dubai Museum", "Al Fahidi District", "Jumeirah Mosque"],
      },
    ],
    suitedFor: [
      {
        type: "Luxury Travelers",
        description:
          "World-class hotels, fine dining, and exclusive shopping experiences",
      },
      {
        type: "Families",
        description:
          "Theme parks, beaches, and family-friendly attractions throughout",
      },
      {
        type: "Adventure Seekers",
        description: "Desert safaris, skydiving, and water sports activities",
      },
      {
        type: "Shopping Enthusiasts",
        description:
          "From traditional souks to ultra-modern malls with global brands",
      },
    ],
    bestTimeToVisit: "November to March",
    currency: "AED (Dirham)",
    language: "Arabic (English widely spoken)",
  },
  singapore: {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    description:
      "Singapore is a sovereign city-state and island country known for its cleanliness, safety, and multicultural harmony. This garden city seamlessly blends modern skyscrapers with lush greenery, offering world-class attractions and diverse culinary experiences.",
    heroImage: "/images/destinations/singapore-hero.jpg",
    highlights: [
      "Marina Bay Sands iconic skyline",
      "Gardens by the Bay Supertrees",
      "Sentosa Island resort complex",
      "Hawker centers with diverse cuisine",
      "Universal Studios Singapore",
      "Singapore Zoo and Night Safari",
    ],
    destinationHighlights: [
      {
        category: "Attractions",
        items: ["Marina Bay Sands", "Gardens by the Bay", "Merlion Park"],
      },
      {
        category: "Nature",
        items: ["Singapore Botanic Gardens", "MacRitchie Reservoir", "Sentosa"],
      },
      {
        category: "Culture",
        items: ["Chinatown", "Little India", "Arab Street"],
      },
      {
        category: "Entertainment",
        items: ["Universal Studios", "Night Safari", "S.E.A. Aquarium"],
      },
    ],
    suitedFor: [
      {
        type: "Foodies",
        description:
          "World-renowned hawker centers and Michelin-starred restaurants",
      },
      {
        type: "Families",
        description:
          "Safe, clean environment with numerous family attractions",
      },
      {
        type: "Nature Lovers",
        description: "Urban gardens, nature reserves, and wildlife experiences",
      },
      {
        type: "Urban Explorers",
        description: "Modern architecture mixed with historic neighborhoods",
      },
    ],
    bestTimeToVisit: "February to April",
    currency: "SGD (Singapore Dollar)",
    language: "English, Mandarin, Malay, Tamil",
  },
  maldives: {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    description:
      "The Maldives is a tropical paradise consisting of 26 atolls in the Indian Ocean, famous for its luxurious overwater bungalows, crystal-clear waters, and vibrant coral reefs. It's the ultimate destination for relaxation and underwater adventures.",
    heroImage: "/images/destinations/maldives-hero.jpg",
    highlights: [
      "Overwater villa experiences",
      "World-class diving and snorkeling",
      "Pristine white sand beaches",
      "Bioluminescent plankton beaches",
      "Luxury spa treatments",
      "Marine life encounters",
    ],
    destinationHighlights: [
      {
        category: "Water Activities",
        items: ["Scuba Diving", "Snorkeling", "Surfing", "Kayaking"],
      },
      {
        category: "Relaxation",
        items: ["Spa Treatments", "Beach Lounging", "Sunset Cruises"],
      },
      {
        category: "Marine Life",
        items: ["Manta Rays", "Whale Sharks", "Sea Turtles", "Coral Reefs"],
      },
      {
        category: "Experiences",
        items: ["Underwater Dining", "Island Hopping", "Fishing Trips"],
      },
    ],
    suitedFor: [
      {
        type: "Honeymooners",
        description: "Romantic overwater villas and private island experiences",
      },
      {
        type: "Divers",
        description: "Some of the world's best diving spots with rich marine life",
      },
      {
        type: "Luxury Seekers",
        description: "Ultra-luxury resorts with world-class service",
      },
      {
        type: "Beach Lovers",
        description: "Picture-perfect beaches with turquoise waters",
      },
    ],
    bestTimeToVisit: "November to April",
    currency: "MVR (Maldivian Rufiyaa)",
    language: "Dhivehi (English in resorts)",
  },
  bali: {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    description:
      "Bali is an Indonesian island paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. The island is also famous for its yoga and meditation retreats, vibrant culture, and spiritual atmosphere.",
    heroImage: "/images/destinations/bali-hero.jpg",
    highlights: [
      "Tegallalang Rice Terraces",
      "Ancient Hindu temples",
      "Ubud's art and culture scene",
      "Beautiful beaches and surf spots",
      "Traditional Balinese ceremonies",
      "Wellness and yoga retreats",
    ],
    destinationHighlights: [
      {
        category: "Culture",
        items: ["Tanah Lot Temple", "Uluwatu Temple", "Traditional Dance"],
      },
      {
        category: "Nature",
        items: ["Mount Batur", "Rice Terraces", "Waterfalls", "Sacred Forests"],
      },
      {
        category: "Activities",
        items: ["Surfing", "Yoga", "Diving", "Temple Tours"],
      },
      {
        category: "Wellness",
        items: ["Spa Treatments", "Meditation", "Healthy Cuisine"],
      },
    ],
    suitedFor: [
      {
        type: "Spiritual Seekers",
        description: "Yoga retreats, meditation, and spiritual experiences",
      },
      {
        type: "Culture Enthusiasts",
        description: "Rich Balinese culture, temples, and traditional arts",
      },
      {
        type: "Surfers",
        description: "World-class surf breaks for all skill levels",
      },
      {
        type: "Digital Nomads",
        description: "Great wifi, co-working spaces, and vibrant community",
      },
    ],
    bestTimeToVisit: "April to October",
    currency: "IDR (Indonesian Rupiah)",
    language: "Indonesian, Balinese",
  },
  // Add more destinations as needed...
};
