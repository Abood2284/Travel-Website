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
  bangkok: {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    description:
      "Bangkok is Thailand's vibrant capital, a city of contrasts where ancient temples stand alongside modern skyscrapers. Known for its ornate shrines, bustling street life, world-class street food, and vibrant nightlife, Bangkok offers an unforgettable sensory experience.",
    heroImage: "/images/destinations/bangkok-hero.jpg",
    highlights: [
      "Grand Palace and Wat Phra Kaew",
      "Floating markets",
      "Street food paradise",
      "Rooftop bars with city views",
      "Ancient temples and shrines",
      "Vibrant nightlife scene",
    ],
    destinationHighlights: [
      {
        category: "Temples",
        items: ["Grand Palace", "Wat Arun", "Wat Pho", "Golden Mount"],
      },
      {
        category: "Food",
        items: ["Street Food Tours", "Night Markets", "Cooking Classes"],
      },
      {
        category: "Shopping",
        items: ["Chatuchak Market", "MBK Center", "Siam Paragon"],
      },
      {
        category: "Entertainment",
        items: ["Rooftop Bars", "Muay Thai", "River Cruises"],
      },
    ],
    suitedFor: [
      {
        type: "Foodies",
        description: "World-famous street food and authentic Thai cuisine",
      },
      {
        type: "Culture Seekers",
        description: "Ancient temples, palaces, and traditional experiences",
      },
      {
        type: "Night Owls",
        description: "Vibrant nightlife, rooftop bars, and night markets",
      },
      {
        type: "Budget Travelers",
        description: "Affordable accommodation, food, and transportation",
      },
    ],
    bestTimeToVisit: "November to February",
    currency: "THB (Thai Baht)",
    language: "Thai (English in tourist areas)",
  },
  phuket: {
    id: "phuket",
    name: "Phuket",
    country: "Thailand",
    description:
      "Phuket is Thailand's largest island, famous for its stunning beaches, crystal-clear waters, and vibrant nightlife. From the bustling Patong Beach to serene hidden coves, Phuket offers something for every type of traveler.",
    heroImage: "/images/destinations/phuket-hero.jpg",
    highlights: [
      "Stunning beaches and clear waters",
      "Island hopping tours",
      "Big Buddha viewpoint",
      "Old Phuket Town charm",
      "Water sports paradise",
      "Fresh seafood dining",
    ],
    destinationHighlights: [
      {
        category: "Beaches",
        items: ["Patong Beach", "Kata Beach", "Karon Beach", "Freedom Beach"],
      },
      {
        category: "Activities",
        items: ["Snorkeling", "Diving", "Island Tours", "Water Sports"],
      },
      {
        category: "Attractions",
        items: ["Big Buddha", "Old Town", "Viewpoints", "Night Markets"],
      },
      {
        category: "Entertainment",
        items: ["Beach Clubs", "Nightlife", "Cultural Shows"],
      },
    ],
    suitedFor: [
      {
        type: "Beach Lovers",
        description: "Beautiful beaches ranging from lively to secluded",
      },
      {
        type: "Water Sports Enthusiasts",
        description: "Diving, snorkeling, kayaking, and more",
      },
      {
        type: "Party Seekers",
        description: "Famous nightlife scene, especially in Patong",
      },
      {
        type: "Families",
        description: "Safe beaches and family-friendly resorts",
      },
    ],
    bestTimeToVisit: "November to April",
    currency: "THB (Thai Baht)",
    language: "Thai (English widely spoken)",
  },
  thailand: {
    id: "thailand",
    name: "Thailand",
    country: "Thailand",
    description:
      "Thailand, the Land of Smiles, offers an incredible diversity of experiences from bustling Bangkok to tropical islands, ancient temples to modern cities, and world-renowned cuisine to warm hospitality. It's a destination that captivates every type of traveler.",
    heroImage: "/images/destinations/thailand-hero.jpg",
    highlights: [
      "Ancient temples and palaces",
      "Tropical islands and beaches",
      "World-class street food",
      "Rich cultural heritage",
      "Affordable luxury travel",
      "Friendly local culture",
    ],
    destinationHighlights: [
      {
        category: "Regions",
        items: ["Bangkok", "Phuket", "Chiang Mai", "Krabi", "Koh Samui"],
      },
      {
        category: "Culture",
        items: ["Buddhist Temples", "Royal Palaces", "Traditional Markets"],
      },
      {
        category: "Nature",
        items: ["Tropical Islands", "Jungles", "Beaches", "Mountains"],
      },
      {
        category: "Experiences",
        items: ["Thai Massage", "Cooking Classes", "Muay Thai", "Festivals"],
      },
    ],
    suitedFor: [
      {
        type: "First-Time Visitors",
        description: "Easy to navigate with diverse experiences for everyone",
      },
      {
        type: "Budget Travelers",
        description: "Excellent value for money across all categories",
      },
      {
        type: "Foodies",
        description: "World-famous cuisine from street food to fine dining",
      },
      {
        type: "Adventure Seekers",
        description: "Trekking, diving, island hopping, and more",
      },
    ],
    bestTimeToVisit: "November to March",
    currency: "THB (Thai Baht)",
    language: "Thai (English in tourist areas)",
  },
  istanbul: {
    id: "istanbul",
    name: "Istanbul",
    country: "Turkey",
    description:
      "Istanbul is a mesmerizing city that straddles two continents, where East meets West. This historic metropolis boasts stunning Byzantine and Ottoman architecture, vibrant bazaars, delicious cuisine, and a rich cultural tapestry that spans thousands of years.",
    heroImage: "/images/destinations/istanbul-hero.jpg",
    highlights: [
      "Hagia Sophia and Blue Mosque",
      "Grand Bazaar shopping",
      "Bosphorus cruise",
      "Turkish cuisine and tea",
      "Historic palaces",
      "Vibrant arts scene",
    ],
    destinationHighlights: [
      {
        category: "Historic Sites",
        items: ["Hagia Sophia", "Blue Mosque", "Topkapi Palace", "Basilica Cistern"],
      },
      {
        category: "Shopping",
        items: ["Grand Bazaar", "Spice Bazaar", "Modern Malls"],
      },
      {
        category: "Food",
        items: ["Turkish Kebabs", "Baklava", "Turkish Coffee", "Meze"],
      },
      {
        category: "Experiences",
        items: ["Bosphorus Cruise", "Turkish Bath", "Whirling Dervishes"],
      },
    ],
    suitedFor: [
      {
        type: "History Buffs",
        description: "Thousands of years of history from Roman to Ottoman eras",
      },
      {
        type: "Culture Enthusiasts",
        description: "Unique blend of European and Asian cultures",
      },
      {
        type: "Foodies",
        description: "Rich culinary tradition with diverse flavors",
      },
      {
        type: "Photographers",
        description: "Stunning architecture and scenic waterfront views",
      },
    ],
    bestTimeToVisit: "April to May, September to November",
    currency: "TRY (Turkish Lira)",
    language: "Turkish (English in tourist areas)",
  },
  doha: {
    id: "doha",
    name: "Doha",
    country: "Qatar",
    description:
      "Doha is Qatar's modern capital on the Persian Gulf, a city of futuristic skyscrapers, luxury shopping, and world-class museums. This rapidly growing metropolis seamlessly blends traditional Arabian culture with contemporary innovation.",
    heroImage: "/images/destinations/doha-hero.jpg",
    highlights: [
      "Museum of Islamic Art",
      "Souq Waqif traditional market",
      "The Pearl-Qatar island",
      "Futuristic skyline",
      "Desert adventures",
      "Luxury shopping malls",
    ],
    destinationHighlights: [
      {
        category: "Culture",
        items: ["Museum of Islamic Art", "National Museum", "Katara Village"],
      },
      {
        category: "Shopping",
        items: ["Souq Waqif", "Villaggio Mall", "The Pearl"],
      },
      {
        category: "Modern",
        items: ["Corniche", "West Bay", "Education City"],
      },
      {
        category: "Activities",
        items: ["Desert Safari", "Dhow Cruise", "Beach Clubs"],
      },
    ],
    suitedFor: [
      {
        type: "Luxury Travelers",
        description: "World-class hotels, dining, and shopping experiences",
      },
      {
        type: "Culture Seekers",
        description: "Rich Islamic heritage and modern museums",
      },
      {
        type: "Transit Stopover",
        description: "Perfect for layovers with easy airport access",
      },
      {
        type: "Sports Fans",
        description: "Major sporting events and state-of-the-art venues",
      },
    ],
    bestTimeToVisit: "November to April",
    currency: "QAR (Qatari Riyal)",
    language: "Arabic (English widely spoken)",
  },
  muscat: {
    id: "muscat",
    name: "Muscat",
    country: "Oman",
    description:
      "Muscat, Oman's capital, is a beautiful blend of ancient and modern, where traditional souqs and forts sit alongside contemporary architecture. Surrounded by mountains and desert, with stunning coastline, it offers authentic Arabian experiences without the crowds.",
    heroImage: "/images/destinations/muscat-hero.jpg",
    highlights: [
      "Sultan Qaboos Grand Mosque",
      "Mutrah Souq shopping",
      "Stunning mountain scenery",
      "Beautiful beaches",
      "Historic forts",
      "Authentic Omani culture",
    ],
    destinationHighlights: [
      {
        category: "Landmarks",
        items: ["Grand Mosque", "Royal Opera House", "Al Alam Palace"],
      },
      {
        category: "Historic",
        items: ["Mutrah Fort", "Al Jalali Fort", "Al Mirani Fort"],
      },
      {
        category: "Nature",
        items: ["Beaches", "Wadis", "Mountains", "Desert"],
      },
      {
        category: "Culture",
        items: ["Souqs", "Traditional Villages", "Local Cuisine"],
      },
    ],
    suitedFor: [
      {
        type: "Culture Seekers",
        description: "Authentic Arabian culture and warm hospitality",
      },
      {
        type: "Nature Lovers",
        description: "Diverse landscapes from mountains to beaches",
      },
      {
        type: "Peace Seekers",
        description: "Less crowded than other Gulf destinations",
      },
      {
        type: "Adventure Travelers",
        description: "Wadi swimming, mountain hiking, desert camping",
      },
    ],
    bestTimeToVisit: "October to April",
    currency: "OMR (Omani Rial)",
    language: "Arabic (English widely spoken)",
  },
  paris: {
    id: "paris",
    name: "Paris",
    country: "France",
    description:
      "Paris, the City of Light, is synonymous with romance, art, fashion, and gastronomy. From the iconic Eiffel Tower to world-class museums, charming cafés to haute couture, Paris captivates with its timeless elegance and cultural richness.",
    heroImage: "/images/destinations/paris-hero.jpg",
    highlights: [
      "Eiffel Tower and Champs-Élysées",
      "Louvre and Musée d'Orsay",
      "Notre-Dame Cathedral",
      "Montmartre and Sacré-Cœur",
      "Seine River cruises",
      "World-class dining",
    ],
    destinationHighlights: [
      {
        category: "Landmarks",
        items: ["Eiffel Tower", "Arc de Triomphe", "Notre-Dame", "Sacré-Cœur"],
      },
      {
        category: "Museums",
        items: ["Louvre", "Musée d'Orsay", "Centre Pompidou", "Rodin Museum"],
      },
      {
        category: "Neighborhoods",
        items: ["Montmartre", "Le Marais", "Latin Quarter", "Saint-Germain"],
      },
      {
        category: "Experiences",
        items: ["Café Culture", "River Cruises", "Fashion Shopping", "Pastries"],
      },
    ],
    suitedFor: [
      {
        type: "Art Lovers",
        description: "World-renowned museums and galleries",
      },
      {
        type: "Romantics",
        description: "Quintessential romantic city with charming atmosphere",
      },
      {
        type: "Foodies",
        description: "Exceptional cuisine from bistros to Michelin stars",
      },
      {
        type: "History Enthusiasts",
        description: "Rich history spanning centuries",
      },
    ],
    bestTimeToVisit: "April to June, September to October",
    currency: "EUR (Euro)",
    language: "French (English in tourist areas)",
  },
  london: {
    id: "london",
    name: "London",
    country: "UK",
    description:
      "London is a dynamic metropolis where history meets modernity. From royal palaces to cutting-edge architecture, world-class museums to diverse neighborhoods, London offers endless discoveries in one of the world's most influential cities.",
    heroImage: "/images/destinations/london-hero.jpg",
    highlights: [
      "Buckingham Palace and Tower of London",
      "British Museum and National Gallery",
      "West End theater district",
      "Hyde Park and gardens",
      "Diverse food scene",
      "Historic pubs and tea culture",
    ],
    destinationHighlights: [
      {
        category: "Historic",
        items: ["Tower of London", "Buckingham Palace", "Westminster Abbey", "Big Ben"],
      },
      {
        category: "Museums",
        items: ["British Museum", "Natural History", "V&A", "Tate Modern"],
      },
      {
        category: "Entertainment",
        items: ["West End Shows", "Markets", "Pubs", "Live Music"],
      },
      {
        category: "Areas",
        items: ["Covent Garden", "Camden", "Notting Hill", "Shoreditch"],
      },
    ],
    suitedFor: [
      {
        type: "Culture Enthusiasts",
        description: "World-class museums, theaters, and cultural institutions",
      },
      {
        type: "History Buffs",
        description: "Royal heritage and centuries of fascinating history",
      },
      {
        type: "Foodies",
        description: "Diverse international cuisine and traditional British fare",
      },
      {
        type: "Urban Explorers",
        description: "Vibrant neighborhoods each with unique character",
      },
    ],
    bestTimeToVisit: "May to September",
    currency: "GBP (British Pound)",
    language: "English",
  },
  amsterdam: {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    description:
      "Amsterdam is a charming city of canals, bikes, and historic architecture. Known for its artistic heritage, elaborate canal system, narrow houses, and vibrant cultural scene, Amsterdam offers a unique and laid-back European experience.",
    heroImage: "/images/destinations/amsterdam-hero.jpg",
    highlights: [
      "Picturesque canal system",
      "Anne Frank House",
      "Van Gogh Museum",
      "Cycling culture",
      "Historic architecture",
      "Vibrant nightlife",
    ],
    destinationHighlights: [
      {
        category: "Museums",
        items: ["Rijksmuseum", "Van Gogh Museum", "Anne Frank House", "Stedelijk"],
      },
      {
        category: "Canals",
        items: ["Canal Cruises", "Jordaan District", "Nine Streets"],
      },
      {
        category: "Culture",
        items: ["Cycling Routes", "Markets", "Brown Cafés", "Live Music"],
      },
      {
        category: "Day Trips",
        items: ["Zaanse Schans", "Keukenhof", "Volendam", "Haarlem"],
      },
    ],
    suitedFor: [
      {
        type: "Art Lovers",
        description: "World-class art museums and galleries",
      },
      {
        type: "Cyclists",
        description: "Bike-friendly city with extensive cycling infrastructure",
      },
      {
        type: "History Enthusiasts",
        description: "Rich history and well-preserved historic center",
      },
      {
        type: "Liberal Travelers",
        description: "Progressive culture and open-minded atmosphere",
      },
    ],
    bestTimeToVisit: "April to May, September to November",
    currency: "EUR (Euro)",
    language: "Dutch (English widely spoken)",
  },
  rome: {
    id: "rome",
    name: "Rome",
    country: "Italy",
    description:
      "Rome, the Eternal City, is an open-air museum where ancient ruins stand alongside Renaissance masterpieces. With nearly 3,000 years of history, incredible food, and vibrant street life, Rome is a feast for all senses.",
    heroImage: "/images/destinations/rome-hero.jpg",
    highlights: [
      "Colosseum and Roman Forum",
      "Vatican City and Sistine Chapel",
      "Trevi Fountain",
      "Authentic Italian cuisine",
      "Historic piazzas",
      "Ancient architecture",
    ],
    destinationHighlights: [
      {
        category: "Ancient",
        items: ["Colosseum", "Roman Forum", "Pantheon", "Palatine Hill"],
      },
      {
        category: "Vatican",
        items: ["St. Peter's Basilica", "Sistine Chapel", "Vatican Museums"],
      },
      {
        category: "Piazzas",
        items: ["Trevi Fountain", "Spanish Steps", "Piazza Navona"],
      },
      {
        category: "Food",
        items: ["Pasta", "Pizza", "Gelato", "Wine Bars"],
      },
    ],
    suitedFor: [
      {
        type: "History Enthusiasts",
        description: "Unparalleled ancient Roman and Renaissance history",
      },
      {
        type: "Art Lovers",
        description: "Incredible art from Michelangelo to Caravaggio",
      },
      {
        type: "Foodies",
        description: "Authentic Italian cuisine at its finest",
      },
      {
        type: "Photographers",
        description: "Stunning architecture and picturesque streets",
      },
    ],
    bestTimeToVisit: "April to June, September to October",
    currency: "EUR (Euro)",
    language: "Italian (English in tourist areas)",
  },
  zurich: {
    id: "zurich",
    name: "Zurich",
    country: "Switzerland",
    description:
      "Zurich is Switzerland's largest city, a global financial hub set on Lake Zurich with stunning Alpine backdrop. Known for its efficient public transport, clean streets, high quality of life, and beautiful old town, Zurich combines urban sophistication with natural beauty.",
    heroImage: "/images/destinations/zurich-hero.jpg",
    highlights: [
      "Beautiful Lake Zurich",
      "Charming Old Town",
      "Swiss chocolate and cheese",
      "Nearby Alpine excursions",
      "World-class shopping",
      "Clean and safe environment",
    ],
    destinationHighlights: [
      {
        category: "Old Town",
        items: ["Grossmünster", "Fraumünster", "Bahnhofstrasse", "Lindenhof"],
      },
      {
        category: "Nature",
        items: ["Lake Zurich", "Uetliberg Mountain", "Parks", "River Limmat"],
      },
      {
        category: "Culture",
        items: ["Museums", "Opera House", "Art Galleries", "Churches"],
      },
      {
        category: "Day Trips",
        items: ["Rhine Falls", "Lucerne", "Alps", "Swiss Villages"],
      },
    ],
    suitedFor: [
      {
        type: "Luxury Travelers",
        description: "High-end shopping, dining, and accommodation",
      },
      {
        type: "Nature Lovers",
        description: "Beautiful lake and easy access to mountains",
      },
      {
        type: "City Breakers",
        description: "Efficient, clean, and walkable city center",
      },
      {
        type: "Chocolate Lovers",
        description: "Home to famous Swiss chocolate makers",
      },
    ],
    bestTimeToVisit: "June to August, December",
    currency: "CHF (Swiss Franc)",
    language: "German, English widely spoken",
  },
  cairo: {
    id: "cairo",
    name: "Cairo",
    country: "Egypt",
    description:
      "Cairo, the capital of Egypt, is a sprawling, ancient city on the Nile River. Home to the iconic Pyramids of Giza and the Sphinx, Cairo offers a gateway to one of the world's oldest civilizations with bustling bazaars, Islamic architecture, and the treasures of the Egyptian Museum.",
    heroImage: "/images/destinations/cairo-hero.jpg",
    highlights: [
      "Pyramids of Giza and Sphinx",
      "Egyptian Museum treasures",
      "Islamic Cairo architecture",
      "Khan el-Khalili bazaar",
      "Nile River cruises",
      "Ancient history",
    ],
    destinationHighlights: [
      {
        category: "Ancient",
        items: ["Pyramids of Giza", "Sphinx", "Saqqara", "Memphis"],
      },
      {
        category: "Museums",
        items: ["Egyptian Museum", "Coptic Museum", "Islamic Art Museum"],
      },
      {
        category: "Islamic",
        items: ["Citadel", "Muhammad Ali Mosque", "Al-Azhar Mosque"],
      },
      {
        category: "Experiences",
        items: ["Khan el-Khalili", "Nile Cruise", "Sound & Light Show"],
      },
    ],
    suitedFor: [
      {
        type: "History Enthusiasts",
        description: "One of the world's oldest continuous civilizations",
      },
      {
        type: "Adventure Seekers",
        description: "Desert excursions and archaeological wonders",
      },
      {
        type: "Budget Travelers",
        description: "Affordable destination with incredible value",
      },
      {
        type: "Culture Seekers",
        description: "Rich Islamic and Coptic heritage",
      },
    ],
    bestTimeToVisit: "October to April",
    currency: "EGP (Egyptian Pound)",
    language: "Arabic (English in tourist areas)",
  },
  baku: {
    id: "baku",
    name: "Baku",
    country: "Azerbaijan",
    description:
      "Baku is Azerbaijan's capital on the Caspian Sea, a city where medieval Old Town meets futuristic skyscrapers. Known for its oil wealth, Flame Towers, and the walled Old City, Baku offers a unique blend of ancient and ultra-modern.",
    heroImage: "/images/destinations/baku-hero.jpg",
    highlights: [
      "Flame Towers skyline",
      "Medieval Old City (Icherisheher)",
      "Maiden Tower",
      "Modern architecture",
      "Caspian Sea waterfront",
      "Affordable luxury",
    ],
    destinationHighlights: [
      {
        category: "Old City",
        items: ["Maiden Tower", "Palace of Shirvanshahs", "Caravanserais"],
      },
      {
        category: "Modern",
        items: ["Flame Towers", "Heydar Aliyev Center", "Baku Boulevard"],
      },
      {
        category: "Culture",
        items: ["Carpet Museum", "Museums", "Traditional Tea Houses"],
      },
      {
        category: "Day Trips",
        items: ["Gobustan", "Mud Volcanoes", "Fire Temple", "Absheron"],
      },
    ],
    suitedFor: [
      {
        type: "Architecture Fans",
        description: "Unique blend of medieval and futuristic architecture",
      },
      {
        type: "Budget Travelers",
        description: "Affordable destination with great value",
      },
      {
        type: "Culture Seekers",
        description: "Rich Silk Road heritage and modern culture",
      },
      {
        type: "Off-the-Beaten-Path",
        description: "Less touristy than other capitals",
      },
    ],
    bestTimeToVisit: "April to June, September to October",
    currency: "AZN (Azerbaijani Manat)",
    language: "Azerbaijani (Russian, English in tourism)",
  },
  mauritius: {
    id: "mauritius",
    name: "Mauritius",
    country: "Mauritius",
    description:
      "Mauritius is a volcanic island nation in the Indian Ocean, known for its beaches, lagoons, and reefs. With diverse culture, lush interior, and luxury resorts, Mauritius offers a tropical paradise with excellent dining, water sports, and natural beauty.",
    heroImage: "/images/destinations/mauritius-hero.jpg",
    highlights: [
      "Pristine beaches and lagoons",
      "Seven Colored Earths",
      "Water sports paradise",
      "Diverse culture and cuisine",
      "Luxury resorts",
      "Botanical gardens",
    ],
    destinationHighlights: [
      {
        category: "Beaches",
        items: ["Belle Mare", "Le Morne", "Flic en Flac", "Trou aux Biches"],
      },
      {
        category: "Nature",
        items: ["Black River Gorges", "Chamarel", "Ile aux Cerfs", "Waterfalls"],
      },
      {
        category: "Activities",
        items: ["Snorkeling", "Diving", "Sailing", "Dolphin Watching"],
      },
      {
        category: "Culture",
        items: ["Port Louis", "Markets", "Temples", "Colonial History"],
      },
    ],
    suitedFor: [
      {
        type: "Beach Lovers",
        description: "Stunning beaches with turquoise lagoons",
      },
      {
        type: "Honeymooners",
        description: "Romantic luxury resorts and private beaches",
      },
      {
        type: "Water Sports Fans",
        description: "Excellent diving, snorkeling, and sailing",
      },
      {
        type: "Nature Enthusiasts",
        description: "Diverse landscapes and unique wildlife",
      },
    ],
    bestTimeToVisit: "May to December",
    currency: "MUR (Mauritian Rupee)",
    language: "English, French, Mauritian Creole",
  },
  tokyo: {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    description:
      "Tokyo is Japan's busy capital, a city where ancient tradition meets cutting-edge technology. From serene temples to neon-lit streets, sumo wrestling to manga culture, and world-class dining to efficient public transport, Tokyo offers an unparalleled urban experience.",
    heroImage: "/images/destinations/tokyo-hero.jpg",
    highlights: [
      "Shibuya and Shinjuku districts",
      "Traditional temples and shrines",
      "World-class sushi and ramen",
      "Cherry blossom season",
      "Anime and manga culture",
      "Efficient public transport",
    ],
    destinationHighlights: [
      {
        category: "Districts",
        items: ["Shibuya", "Shinjuku", "Harajuku", "Ginza", "Asakusa"],
      },
      {
        category: "Culture",
        items: ["Senso-ji Temple", "Meiji Shrine", "Imperial Palace"],
      },
      {
        category: "Modern",
        items: ["Tokyo Skytree", "TeamLab", "Robot Restaurant", "Akihabara"],
      },
      {
        category: "Food",
        items: ["Sushi", "Ramen", "Izakayas", "Street Food"],
      },
    ],
    suitedFor: [
      {
        type: "Foodies",
        description: "Incredible dining from Michelin stars to street food",
      },
      {
        type: "Tech Enthusiasts",
        description: "Cutting-edge technology and electronics",
      },
      {
        type: "Culture Seekers",
        description: "Perfect blend of traditional and modern culture",
      },
      {
        type: "Anime Fans",
        description: "Manga, anime, and pop culture hub",
      },
    ],
    bestTimeToVisit: "March to May, October to November",
    currency: "JPY (Japanese Yen)",
    language: "Japanese (English in major areas)",
  },
  sydney: {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    description:
      "Sydney is Australia's largest city, famous for its stunning harbor, iconic Opera House, and beautiful beaches. With a laid-back lifestyle, diverse neighborhoods, excellent dining scene, and year-round sunshine, Sydney offers the perfect urban beach experience.",
    heroImage: "/images/destinations/sydney-hero.jpg",
    highlights: [
      "Sydney Opera House",
      "Harbour Bridge",
      "Bondi and Manly beaches",
      "Vibrant food scene",
      "Coastal walks",
      "Outdoor lifestyle",
    ],
    destinationHighlights: [
      {
        category: "Landmarks",
        items: ["Opera House", "Harbour Bridge", "Royal Botanic Garden"],
      },
      {
        category: "Beaches",
        items: ["Bondi", "Manly", "Coogee", "Bronte"],
      },
      {
        category: "Areas",
        items: ["The Rocks", "Darling Harbour", "Surry Hills", "Newtown"],
      },
      {
        category: "Activities",
        items: ["Coastal Walks", "Surfing", "Sailing", "Wildlife"],
      },
    ],
    suitedFor: [
      {
        type: "Beach Lovers",
        description: "World-famous beaches with great surf",
      },
      {
        type: "Outdoor Enthusiasts",
        description: "Beautiful harbor, coastal walks, and outdoor activities",
      },
      {
        type: "Foodies",
        description: "Diverse dining scene with fresh local produce",
      },
      {
        type: "Urban Explorers",
        description: "Vibrant neighborhoods and cultural attractions",
      },
    ],
    bestTimeToVisit: "September to November, March to May",
    currency: "AUD (Australian Dollar)",
    language: "English",
  },
  "new-york": {
    id: "new-york",
    name: "New York",
    country: "USA",
    description:
      "New York City, the city that never sleeps, is a global hub of culture, finance, art, and entertainment. From Broadway shows to world-class museums, iconic skyscrapers to diverse neighborhoods, NYC offers endless energy and unforgettable experiences.",
    heroImage: "/images/destinations/new-york-hero.jpg",
    highlights: [
      "Statue of Liberty and Empire State Building",
      "Times Square and Broadway",
      "Central Park",
      "World-class museums",
      "Diverse food scene",
      "Vibrant neighborhoods",
    ],
    destinationHighlights: [
      {
        category: "Landmarks",
        items: ["Statue of Liberty", "Empire State", "Brooklyn Bridge", "One World"],
      },
      {
        category: "Culture",
        items: ["MoMA", "Met Museum", "Broadway", "Lincoln Center"],
      },
      {
        category: "Neighborhoods",
        items: ["Manhattan", "Brooklyn", "Queens", "The Bronx"],
      },
      {
        category: "Food",
        items: ["Pizza", "Bagels", "International Cuisine", "Fine Dining"],
      },
    ],
    suitedFor: [
      {
        type: "Culture Enthusiasts",
        description: "World-class museums, theaters, and art galleries",
      },
      {
        type: "Foodies",
        description: "Every cuisine imaginable from street food to Michelin stars",
      },
      {
        type: "Urban Explorers",
        description: "Iconic neighborhoods each with unique character",
      },
      {
        type: "Entertainment Seekers",
        description: "Broadway, concerts, nightlife, and events",
      },
    ],
    bestTimeToVisit: "April to June, September to November",
    currency: "USD (US Dollar)",
    language: "English",
  },
  "united-states": {
    id: "united-states",
    name: "United States",
    country: "USA",
    description:
      "The United States offers incredible diversity from coast to coast. From the skyscrapers of New York to the beaches of California, the music of Nashville to the natural wonders of national parks, the USA provides endless adventures and experiences for every type of traveler.",
    heroImage: "/images/destinations/usa-hero.jpg",
    highlights: [
      "Diverse landscapes and climates",
      "National parks and natural wonders",
      "Vibrant cities",
      "Rich cultural diversity",
      "Road trip opportunities",
      "World-class entertainment",
    ],
    destinationHighlights: [
      {
        category: "Cities",
        items: ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"],
      },
      {
        category: "Nature",
        items: ["Grand Canyon", "Yellowstone", "Yosemite", "Hawaii"],
      },
      {
        category: "Culture",
        items: ["Museums", "Music Scenes", "Sports", "Theme Parks"],
      },
      {
        category: "Experiences",
        items: ["Road Trips", "Food Tours", "National Parks", "Beach Resorts"],
      },
    ],
    suitedFor: [
      {
        type: "Road Trippers",
        description: "Vast country perfect for epic road trips",
      },
      {
        type: "Nature Lovers",
        description: "Incredible national parks and diverse landscapes",
      },
      {
        type: "City Explorers",
        description: "World-famous cities with unique identities",
      },
      {
        type: "Adventure Seekers",
        description: "Every type of outdoor activity imaginable",
      },
    ],
    bestTimeToVisit: "Varies by region - generally April to October",
    currency: "USD (US Dollar)",
    language: "English",
  },
};
