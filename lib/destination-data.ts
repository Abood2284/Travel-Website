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
  bali: {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    description:
      "Bali is an Indonesian island paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs—famous for wellness retreats and vibrant culture.",
    heroImage: "/countries/bali.jpg",
    highlights: [
      "Rice terraces of Tegallalang",
      "Sacred temples and traditional ceremonies",
      "World-class beaches and surf spots",
      "Ubud arts and cultural center",
      "Mount Batur sunrise trekking",
      "Yoga and wellness retreats"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Tanah Lot Temple", "Uluwatu Temple", "Besakih Temple"]
      },
      {
        category: "Shopping",
        items: ["Ubud Art Market", "Seminyak Boutiques", "Traditional Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Kecak Dance Shows", "Beach Clubs", "Water Sports"]
      },
      {
        category: "Culture",
        items: ["Temple Ceremonies", "Traditional Dance", "Batik Workshops"]
      }
    ],
    suitedFor: [
      { type: "luxury", description: "Yoga and spa retreats" },
      { type: "adventure", description: "Surfing and sun" },
      { type: "family", description: "Temples and traditions" },
      {
        type: "shopping",
        description: "Rice terraces and beaches"
      }
    ],
    bestTimeToVisit: "April to October",
    currency: "IDR (Indonesian Rupiah)",
    language: "Indonesian, Balinese"
  },

  "united-states": {
    id: "united-states",
    name: "United States",
    country: "United States of America",
    description:
      "The United States offers coast-to-coast variety: major cities, national parks, beaches, and cultural hubs—ideal for road trips and immersive city stays.",
    heroImage: "/countries/united-states.jpg",
    highlights: [
      "Grand Canyon and Yellowstone National Parks",
      "New York City skyline and culture",
      "Los Angeles and Hollywood",
      "San Francisco's Golden Gate Bridge",
      "Epic road trips across diverse landscapes",
      "World-class entertainment and dining"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Empire State Building", "Golden Gate Bridge", "White House"]
      },
      {
        category: "Shopping",
        items: ["Fifth Avenue NYC", "Rodeo Drive LA", "Outlet Malls"]
      },
      {
        category: "Entertainment",
        items: ["Broadway Shows", "Universal Studios", "Las Vegas Shows"]
      },
      {
        category: "Culture",
        items: ["Smithsonian Museums", "Hollywood", "Music Scenes"]
      }
    ],
    suitedFor: [
      { type: "adventure", description: "Epic scenic drives" },
      { type: "family", description: "Cultural and food scenes" },
      {
        type: "shopping",
        description: "National parks and landscapes"
      },
      {
        type: "luxury",
        description: "Theme parks and shows"
      }
    ],
    bestTimeToVisit: "Varies by region (Spring/Fall generally best)",
    currency: "USD (US Dollar)",
    language: "English"
  },

  dubai: {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    description:
      "Dubai is a modern metropolis with iconic skyscrapers, luxury shopping, desert adventures and vibrant cultural offerings.",
    heroImage: "/countries/dubai.jpg",
    highlights: [
      "World's tallest building - Burj Khalifa",
      "Luxury shopping at Dubai Mall",
      "Palm Jumeirah artificial island",
      "Traditional gold and spice souks",
      "Desert safaris and dune bashing",
      "World-class dining experiences"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Burj Khalifa", "Burj Al Arab", "Museum of the Future"]
      },
      {
        category: "Shopping",
        items: ["Dubai Mall", "Mall of the Emirates", "Gold Souk"]
      },
      {
        category: "Entertainment",
        items: ["Dubai Fountain", "IMG Worlds", "Ski Dubai"]
      },
      {
        category: "Culture",
        items: ["Dubai Museum", "Al Fahidi District", "Jumeirah Mosque"]
      }
    ],
    suitedFor: [
      {
        type: "luxury",
        description:
          "World-class hotels, fine dining, and exclusive shopping experiences"
      },
      {
        type: "family",
        description:
          "Theme parks, beaches, and family-friendly attractions throughout"
      },
      {
        type: "adventure",
        description: "Desert safaris, skydiving, and water sports activities"
      },
      {
        type: "shopping",
        description:
          "From traditional souks to ultra-modern malls with global brands"
      }
    ],
    bestTimeToVisit: "November to March",
    currency: "AED (Dirham)",
    language: "Arabic (English widely spoken)"
  },

  thailand: {
    id: "thailand",
    name: "Thailand",
    country: "Thailand",
    description:
      "Discover the perfect blend of tropical paradise and rich cultural heritage. Thailand captivates with its golden temples, stunning beaches, and warm hospitality.",
    heroImage: "/countries/thailand.jpg",
    highlights: [
      "Grand Palace and Temple of the Emerald Buddha",
      "Phi Phi Islands and pristine beaches",
      "Floating markets of Bangkok",
      "Ancient city of Ayutthaya",
      "Street food paradise",
      "Traditional Thai massage and wellness"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Grand Palace", "Wat Arun", "Wat Pho"]
      },
      {
        category: "Shopping",
        items: ["Chatuchak Market", "MBK Center", "Night Markets"]
      },
      {
        category: "Entertainment",
        items: ["Thai Boxing Shows", "Floating Markets", "Beach Clubs"]
      },
      {
        category: "Culture",
        items: ["Buddhist Temples", "Traditional Dance", "Cooking Classes"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description:
          "Pristine beaches, crystal-clear waters, and world-class diving spots"
      },
      {
        type: "family",
        description:
          "Ancient temples, traditional ceremonies, and rich Buddhist heritage"
      },
      {
        type: "shopping",
        description:
          "Street food paradise with authentic Thai cuisine at every corner"
      },
      {
        type: "luxury",
        description:
          "Spa retreats, yoga centers, and traditional healing practices"
      }
    ],
    bestTimeToVisit: "November to February",
    currency: "THB (Thai Baht)",
    language: "Thai (English in tourist areas)"
  },

  london: {
    id: "london",
    name: "London",
    country: "United Kingdom",
    description:
      "Walk through centuries of history in one of the world's most iconic cities. From royal palaces to modern art, London seamlessly blends tradition with innovation.",
    heroImage: "/countries/london.jpg",
    highlights: [
      "Buckingham Palace and Changing of the Guard",
      "Tower of London and Crown Jewels",
      "British Museum and world-class galleries",
      "Thames River cruises",
      "West End theatre district",
      "Traditional afternoon tea experience"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Big Ben & Parliament", "Tower Bridge", "St Paul's Cathedral"]
      },
      {
        category: "Shopping",
        items: ["Oxford Street", "Harrods", "Camden Market"]
      },
      {
        category: "Entertainment",
        items: ["West End Shows", "London Eye", "Madame Tussauds"]
      },
      {
        category: "Culture",
        items: ["British Museum", "National Gallery", "Shakespeare's Globe"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description:
          "Rich heritage, royal palaces, and museums spanning centuries"
      },
      {
        type: "shopping",
        description:
          "World-renowned theatres, art galleries, and cultural institutions"
      },
      {
        type: "luxury",
        description:
          "Diverse neighborhoods, from historic Westminster to trendy Shoreditch"
      },
      {
        type: "adventure",
        description:
          "Michelin-starred restaurants and multicultural culinary scene"
      }
    ],
    bestTimeToVisit: "May to September",
    currency: "GBP (British Pound)",
    language: "English"
  },

  bhutan: {
    id: "bhutan",
    name: "Bhutan",
    country: "Bhutan",
    description:
      "Journey to the last Himalayan kingdom where happiness is measured differently. Bhutan offers pristine nature, ancient monasteries, and profound spiritual experiences.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Tiger's Nest Monastery (Paro Taktsang)",
      "Punakha Dzong fortress",
      "Gross National Happiness philosophy",
      "Pristine Himalayan landscapes",
      "Traditional Buddhist culture",
      "Archery - national sport"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Tiger's Nest", "Punakha Dzong", "Trongsa Dzong"]
      },
      {
        category: "Shopping",
        items: [
          "Traditional Handicrafts",
          "Thangka Paintings",
          "Handwoven Textiles"
        ]
      },
      {
        category: "Entertainment",
        items: ["Archery Matches", "Traditional Festivals", "Trekking Routes"]
      },
      {
        category: "Culture",
        items: [
          "Buddhist Monasteries",
          "Masked Dance Festivals",
          "Traditional Ceremonies"
        ]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description:
          "Buddhist monasteries, meditation retreats, and spiritual traditions"
      },
      {
        type: "adventure",
        description:
          "Pristine Himalayan landscapes and untouched natural beauty"
      },
      {
        type: "luxury",
        description:
          "Unique traditions, festivals, and the philosophy of Gross National Happiness"
      },
      {
        type: "shopping",
        description:
          "Scenic mountain trails and high-altitude trekking experiences"
      }
    ],
    bestTimeToVisit: "March to May, September to November",
    currency: "BTN (Bhutanese Ngultrum)",
    language: "Dzongkha (English widely spoken)"
  },

  maldives: {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    description:
      "Experience paradise on Earth in this tropical island nation. The Maldives dazzles with its crystal-clear waters, vibrant coral reefs, and luxurious overwater villas.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Overwater bungalows and luxury resorts",
      "World-class diving and snorkeling",
      "Bioluminescent beaches",
      "Private island experiences",
      "Underwater restaurants",
      "Marine life encounters (manta rays, whale sharks)"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Overwater Villas", "Underwater Suites", "Luxury Resorts"]
      },
      {
        category: "Shopping",
        items: ["Local Handicrafts", "Resort Boutiques", "Malé Markets"]
      },
      {
        category: "Entertainment",
        items: ["Water Sports", "Sunset Cruises", "Spa Treatments"]
      },
      {
        category: "Culture",
        items: ["Local Island Visits", "Traditional Bodu Beru", "Islamic Heritage"]
      }
    ],
    suitedFor: [
      {
        type: "luxury",
        description:
          "Romantic overwater villas, private beaches, and ultimate privacy"
      },
      {
        type: "adventure",
        description:
          "Vibrant coral reefs, diverse marine life, and clear waters"
      },
      {
        type: "family",
        description:
          "Ultra-luxurious resorts with world-class amenities"
      },
      {
        type: "shopping",
        description:
          "Pristine white sand beaches and turquoise lagoons"
      }
    ],
    bestTimeToVisit: "November to April (Dry Season)",
    currency: "MVR (Maldivian Rufiyaa)",
    language: "Dhivehi (English widely spoken)"
  },

  kerala: {
    id: "kerala",
    name: "Kerala",
    country: "India",
    description:
      "Discover India's tropical paradise with serene backwaters, lush greenery, and rich cultural traditions. Kerala offers a perfect blend of relaxation and exploration.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Houseboat cruises in backwaters",
      "Ayurvedic wellness treatments",
      "Tea plantations of Munnar",
      "Periyar Wildlife Sanctuary",
      "Traditional Kathakali dance",
      "Pristine beaches of Kovalam"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Padmanabhaswamy Temple", "Mattancherry Palace", "Hill Stations"]
      },
      {
        category: "Shopping",
        items: ["Spice Markets", "Handicrafts", "Tea & Coffee"]
      },
      {
        category: "Entertainment",
        items: ["Kathakali Shows", "Houseboat Stays", "Beach Activities"]
      },
      {
        category: "Culture",
        items: ["Ayurvedic Centers", "Traditional Villages", "Temples & Churches"]
      }
    ],
    suitedFor: [
      {
        type: "luxury",
        description: "Authentic Ayurvedic treatments and rejuvenation therapies"
      },
      {
        type: "family",
        description:
          "Backwaters, tea gardens, wildlife sanctuaries, and beaches"
      },
      {
        type: "adventure",
        description:
          "Traditional art forms, festivals, and local cuisine"
      },
      {
        type: "shopping",
        description:
          "Serene houseboats and tranquil natural surroundings"
      }
    ],
    bestTimeToVisit: "October to March",
    currency: "INR (Indian Rupee)",
    language: "Malayalam (English, Hindi widely spoken)"
  },

  assam: {
    id: "assam",
    name: "Assam",
    country: "India",
    description:
      "Explore the land of tea gardens and one-horned rhinos. Assam enchants with its verdant landscapes, diverse wildlife, and vibrant Assamese culture.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Kaziranga National Park (UNESCO Site)",
      "Tea garden tours and tastings",
      "Brahmaputra river cruises",
      "Kamakhya Temple",
      "One-horned rhinoceros sightings",
      "Traditional Assamese silk weaving"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Kamakhya Temple", "Talatal Ghar", "Ahom Monuments"]
      },
      {
        category: "Shopping",
        items: ["Assam Tea", "Silk Products", "Handicrafts"]
      },
      {
        category: "Entertainment",
        items: ["Wildlife Safaris", "River Cruises", "Bihu Dance Shows"]
      },
      {
        category: "Culture",
        items: ["Tea Estates", "Tribal Villages", "Traditional Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description:
          "Home to one-horned rhinos, elephants, and diverse bird species"
      },
      {
        type: "family",
        description:
          "Visit world-famous tea estates and learn about tea production"
      },
      {
        type: "luxury",
        description: "Lush green landscapes, river islands, and natural beauty"
      },
      {
        type: "shopping",
        description:
          "Unique Assamese traditions, festivals, and handicrafts"
      }
    ],
    bestTimeToVisit: "November to April",
    currency: "INR (Indian Rupee)",
    language: "Assamese (Hindi, English spoken)"
  },

  himachal: {
    id: "himachal",
    name: "Himachal",
    country: "India",
    description:
      "Escape to the mountains of Himachal Pradesh. From adventure sports to spiritual retreats, this Himalayan state offers breathtaking views and peaceful sanctuaries.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Shimla - Queen of Hills",
      "Manali adventure activities",
      "Dharamshala and McLeod Ganj",
      "Rohtang Pass scenic beauty",
      "Tibetan monasteries",
      "Paragliding in Bir Billing"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Colonial Buildings", "Tibetan Monasteries", "Traditional Temples"]
      },
      {
        category: "Shopping",
        items: ["Woollen Shawls", "Tibetan Handicrafts", "Local Souvenirs"]
      },
      {
        category: "Entertainment",
        items: ["Paragliding", "Skiing", "River Rafting"]
      },
      {
        category: "Culture",
        items: ["Buddhist Monasteries", "Hill Temples", "Local Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description:
          "Trekking, paragliding, skiing, and mountain biking opportunities"
      },
      {
        type: "family",
        description:
          "Scenic mountain towns like Shimla, Manali, and Dalhousie"
      },
      {
        type: "luxury",
        description:
          "Tibetan Buddhist culture and peaceful meditation centers"
      },
      {
        type: "shopping",
        description:
          "Snow-capped peaks, valleys, and stunning Himalayan landscapes"
      }
    ],
    bestTimeToVisit: "March to June, October to February",
    currency: "INR (Indian Rupee)",
    language: "Hindi, Pahari (English widely spoken)"
  },

  meghalaya: {
    id: "meghalaya",
    name: "Meghalaya",
    country: "India",
    description:
      "Visit one of the wettest places on Earth, where nature's beauty knows no bounds. Meghalaya captivates with its living root bridges, waterfalls, and misty hills.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Living root bridges of Cherrapunji",
      "Cleanest village - Mawlynnong",
      "Nohkalikai Falls - India's tallest plunge",
      "Crystal clear Umngot River",
      "Caves and cave systems",
      "Shillong - Scotland of the East"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Living Root Bridges", "Tribal Villages", "Colonial Churches"]
      },
      {
        category: "Shopping",
        items: ["Bamboo Crafts", "Tribal Handicrafts", "Local Markets"]
      },
      {
        category: "Entertainment",
        items: ["Waterfall Trekking", "Caving Expeditions", "River Activities"]
      },
      {
        category: "Culture",
        items: ["Tribal Culture", "Music Scene", "Traditional Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description:
          "Unique living root bridges, waterfalls, and lush landscapes"
      },
      {
        type: "family",
        description:
          "Challenging treks to remote villages and natural wonders"
      },
      {
        type: "luxury",
        description: "Unexplored destinations and unique tribal culture"
      },
      {
        type: "shopping",
        description:
          "Misty hills, dramatic waterfalls, and scenic landscapes"
      }
    ],
    bestTimeToVisit: "October to May",
    currency: "INR (Indian Rupee)",
    language: "Khasi, Garo (English, Hindi spoken)"
  },

  mysore: {
    id: "mysore",
    name: "Mysore",
    country: "India",
    description:
      "Step into royal splendor in this historic city of palaces. Mysore charms visitors with its rich heritage, magnificent architecture, and cultural traditions.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Mysore Palace - architectural marvel",
      "Chamundi Hills and temple",
      "Brindavan Gardens musical fountain",
      "Traditional silk sarees shopping",
      "Mysore Zoo - one of India's best",
      "Sandalwood products and incense"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Mysore Palace", "Jaganmohan Palace", "St. Philomena's Church"]
      },
      {
        category: "Shopping",
        items: ["Silk Sarees", "Sandalwood Items", "Mysore Paintings"]
      },
      {
        category: "Entertainment",
        items: ["Dasara Festival", "Musical Fountains", "Palace Light Show"]
      },
      {
        category: "Culture",
        items: ["Royal Heritage", "Classical Dance", "Traditional Arts"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description:
          "Royal palaces, museums, and rich cultural heritage"
      },
      {
        type: "luxury",
        description:
          "Indo-Saracenic architecture and magnificent monuments"
      },
      {
        type: "shopping",
        description:
          "Famous for silk sarees, sandalwood, and traditional crafts"
      },
      {
        type: "adventure",
        description:
          "Grand Dasara celebrations with royal processions"
      }
    ],
    bestTimeToVisit: "October to March",
    currency: "INR (Indian Rupee)",
    language: "Kannada (English, Hindi spoken)"
  },

  rajasthan: {
    id: "rajasthan",
    name: "Rajasthan",
    country: "India",
    description:
      "Experience the grandeur of India's desert kingdom. Rajasthan dazzles with its majestic forts, vibrant culture, and tales of royal valor.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Magnificent forts and palaces",
      "Thar Desert camel safaris",
      "City Palace complexes",
      "Colorful markets and bazaars",
      "Traditional Rajasthani cuisine",
      "Folk music and dance performances"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Amber Fort", "City Palaces", "Hawa Mahal"]
      },
      {
        category: "Shopping",
        items: ["Handicrafts", "Jewelry & Gemstones", "Traditional Textiles"]
      },
      {
        category: "Entertainment",
        items: ["Desert Safaris", "Folk Performances", "Palace Hotels"]
      },
      {
        category: "Culture",
        items: ["Royal Heritage", "Traditional Arts", "Colorful Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description:
          "Majestic forts, palaces, and tales of Rajput warriors"
      },
      {
        type: "adventure",
        description:
          "Camel safaris, sand dunes, and desert camping"
      },
      {
        type: "luxury",
        description:
          "Stay in heritage hotels and former royal palaces"
      },
      {
        type: "shopping",
        description:
          "Vibrant festivals, folk arts, and traditional crafts"
      }
    ],
    bestTimeToVisit: "October to March",
    currency: "INR (Indian Rupee)",
    language: "Hindi, Rajasthani (English in tourist areas)"
  },

  uttarakhand: {
    id: "uttarakhand",
    name: "Uttarakhand",
    country: "India",
    description:
      "Find spiritual solace in the land of gods. Uttarakhand offers sacred pilgrimage sites, yoga retreats, and stunning Himalayan vistas.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Char Dham pilgrimage circuit",
      "Rishikesh - Yoga Capital of the World",
      "Valley of Flowers National Park",
      "Jim Corbett National Park",
      "Ganga Aarti ceremonies",
      "Adventure sports in Rishikesh"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Ancient Temples", "Ashrams", "Hill Town Churches"]
      },
      {
        category: "Shopping",
        items: ["Woollen Products", "Spiritual Items", "Local Handicrafts"]
      },
      {
        category: "Entertainment",
        items: ["River Rafting", "Trekking", "Wildlife Safaris"]
      },
      {
        category: "Culture",
        items: ["Yoga Retreats", "Temple Rituals", "Spiritual Learning"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description:
          "Sacred temples, ashrams, and ancient pilgrimage sites"
      },
      {
        type: "luxury",
        description:
          "World-renowned yoga and meditation centers in Rishikesh"
      },
      {
        type: "adventure",
        description:
          "River rafting, trekking, and mountain expeditions"
      },
      {
        type: "shopping",
        description:
          "Himalayan peaks, national parks, and pristine valleys"
      }
    ],
    bestTimeToVisit: "April to June, September to November",
    currency: "INR (Indian Rupee)",
    language: "Hindi, Garhwali, Kumaoni (English spoken)"
  },

  ladakh: {
    id: "ladakh",
    name: "Ladakh",
    country: "India",
    description:
      "Journey to the roof of the world in this high-altitude desert. Ladakh mesmerizes with its stark beauty, Buddhist monasteries, and adventure opportunities.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Pangong Lake - stunning blue waters",
      "Nubra Valley and double-humped camels",
      "Ancient Buddhist monasteries",
      "Magnetic Hill phenomenon",
      "Khardung La - world's highest motorable pass",
      "Leh Palace and market"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Buddhist Monasteries", "Leh Palace", "Ancient Stupas"]
      },
      {
        category: "Shopping",
        items: ["Tibetan Handicrafts", "Pashmina Shawls", "Prayer Flags"]
      },
      {
        category: "Entertainment",
        items: ["Mountain Biking", "Motorbiking Tours", "Trekking Routes"]
      },
      {
        category: "Culture",
        items: ["Monastery Festivals", "Buddhist Culture", "Local Traditions"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description:
          "Epic motorbiking routes through high mountain passes"
      },
      {
        type: "family",
        description:
          "Dramatic landscapes, crystal-clear lakes, and barren mountains"
      },
      {
        type: "luxury",
        description:
          "Ancient Buddhist monasteries and peaceful meditation"
      },
      {
        type: "shopping",
        description:
          "High-altitude trekking and challenging expeditions"
      }
    ],
    bestTimeToVisit: "May to September",
    currency: "INR (Indian Rupee)",
    language: "Ladakhi, Hindi (English widely spoken)"
  },

  italy: {
    id: "italy",
    name: "Italy",
    country: "Italy",
    description:
      "Italy is famed for its art, food, historic cities and coastal regions. From the ancient ruins of Rome to the romantic canals of Venice and the rolling hills of Tuscany, Italy offers timeless beauty.",
    heroImage: "/countries/italy.jpg",
    highlights: [
      "Colosseum and Roman Forum",
      "Venice canals and gondola rides",
      "Tuscany wine country and rolling hills",
      "Vatican Museums and Sistine Chapel",
      "Florence Renaissance art and architecture",
      "Amalfi Coast scenic drives"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Colosseum", "St. Peter's Basilica", "Duomo Florence"]
      },
      {
        category: "Shopping",
        items: ["Fashion Boutiques", "Italian Markets", "Artisan Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Opera Houses", "Wine Tours", "Coastal Cruises"]
      },
      {
        category: "Culture",
        items: ["Vatican Museums", "Uffizi Gallery", "Historic Centers"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description:
          "Renaissance masterpieces, ancient ruins, and world-class museums"
      },
      {
        type: "shopping",
        description:
          "Authentic Italian cuisine, wine regions, and culinary traditions"
      },
      {
        type: "luxury",
        description:
          "Enchanting cities, scenic coastlines, and charming villages"
      },
      {
        type: "adventure",
        description:
          "Historic architecture, local traditions, and vibrant city life"
      }
    ],
    bestTimeToVisit: "April to June, September to October",
    currency: "EUR (Euro)",
    language: "Italian"
  },

  jamaica: {
    id: "jamaica",
    name: "Jamaica",
    country: "Jamaica",
    description:
      "Jamaica offers reggae culture, mountain scenery and Caribbean beaches. Experience the vibrant spirit of the island through its music, cuisine, and warm hospitality.",
    heroImage: "/countries/jamiaca.jpg",
    highlights: [
      "Negril's Seven Mile Beach",
      "Dunn's River Falls climbing experience",
      "Bob Marley Museum and reggae heritage",
      "Blue Mountains coffee plantations",
      "Montego Bay marine park snorkeling",
      "Jerk cuisine and local rum tastings"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Rose Hall Great House", "Devon House", "Historic Plantations"]
      },
      {
        category: "Shopping",
        items: ["Craft Markets", "Rum Distilleries", "Local Art"]
      },
      {
        category: "Entertainment",
        items: ["Water Sports", "Reggae Shows", "Beach Clubs"]
      },
      {
        category: "Culture",
        items: [
          "Bob Marley Museum",
          "Music Festivals",
          "Local Cuisine"
        ]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description:
          "Pristine beaches, crystal-clear waters, and water sports"
      },
      {
        type: "family",
        description:
          "Reggae culture, live performances, and musical heritage"
      },
      {
        type: "shopping",
        description:
          "Waterfalls, river rafting, and mountain exploration"
      },
      {
        type: "luxury",
        description:
          "Jerk cuisine, coffee tours, and vibrant local traditions"
      }
    ],
    bestTimeToVisit: "November to April",
    currency: "JMD (Jamaican Dollar)",
    language: "English"
  },

  france: {
    id: "france",
    name: "France",
    country: "France",
    description:
      "France offers world-class art, cuisine, vineyards, coastal regions and historic towns.",
    heroImage: "/countries/france.jpg",
    highlights: [
      "Eiffel Tower and Paris landmarks",
      "Louvre Museum and art galleries",
      "Bordeaux and Burgundy wine regions",
      "French Riviera coastline",
      "Provence lavender fields",
      "Versailles Palace gardens"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Eiffel Tower", "Louvre", "Notre-Dame"]
      },
      {
        category: "Shopping",
        items: ["Champs-Élysées", "Le Marais", "Local Markets"]
      },
      {
        category: "Entertainment",
        items: ["Seine Cruises", "Cabaret Shows", "Wine Tours"]
      },
      {
        category: "Culture",
        items: ["Museums", "Art Galleries", "Historic Sites"]
      }
    ],
    suitedFor: [
      { type: "luxury", description: "Cuisine and wine" },
      { type: "family", description: "Museums and history" },
      {
        type: "shopping",
        description: "Paris and countryside"
      },
      {
        type: "adventure",
        description: "Vineyard tours"
      }
    ],
    bestTimeToVisit: "April to June, Sep to Oct",
    currency: "EUR (Euro)",
    language: "French"
  },

  japan: {
    id: "japan",
    name: "Japan",
    country: "Japan",
    description:
      "Japan mixes ancient traditions and cutting-edge modern culture from Tokyo to Kyoto.",
    heroImage: "/countries/japan.jpg",
    highlights: [
      "Tokyo's vibrant districts and tech",
      "Kyoto temples and gardens",
      "Mount Fuji iconic views",
      "Osaka street food culture",
      "Traditional hot spring resorts",
      "Cherry blossom season"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Temples", "Shrines", "Modern Tokyo"]
      },
      {
        category: "Shopping",
        items: ["Shibuya", "Akihabara", "Traditional Markets"]
      },
      {
        category: "Entertainment",
        items: ["Sumo Wrestling", "Karaoke", "Theme Parks"]
      },
      {
        category: "Culture",
        items: ["Tea Ceremonies", "Temples", "Museums"]
      }
    ],
    suitedFor: [
      { type: "family", description: "Temples and heritage" },
      { type: "shopping", description: "Sushi and regional cuisine" },
      {
        type: "adventure",
        description: "Modern Tokyo experiences"
      },
      {
        type: "luxury",
        description: "Hot springs and relaxation"
      }
    ],
    bestTimeToVisit: "March to May, Sep to Nov",
    currency: "JPY (Japanese Yen)",
    language: "Japanese"
  },

  turkey: {
    id: "turkey",
    name: "Türkiye",
    country: "Türkiye",
    description:
      "Türkiye bridges Europe and Asia with rich history, bazaars and unique landscapes.",
    heroImage: "/countries/turkey.jpg",
    highlights: [
      "Hagia Sophia and Blue Mosque",
      "Cappadocia hot air balloons",
      "Ancient ruins of Ephesus",
      "Turkish baths and hammams",
      "Grand Bazaar shopping",
      "Turquoise Coast beaches"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Hagia Sophia", "Blue Mosque", "Topkapi Palace"]
      },
      {
        category: "Shopping",
        items: ["Grand Bazaar", "Spice Market", "Carpet Shops"]
      },
      {
        category: "Entertainment",
        items: ["Hot Air Balloons", "Boat Cruises", "Turkish Nights"]
      },
      {
        category: "Culture",
        items: ["Historic Sites", "Museums", "Traditional Baths"]
      }
    ],
    suitedFor: [
      { type: "family", description: "Ancient sites" },
      {
        type: "adventure",
        description: "Ballooning and trekking"
      },
      {
        type: "shopping",
        description: "Bazaars and markets"
      },
      {
        type: "luxury",
        description: "Rich heritage"
      }
    ],
    bestTimeToVisit: "April to June, Sep to Oct",
    currency: "TRY (Turkish Lira)",
    language: "Turkish"
  },

  china: {
    id: "china",
    name: "China",
    country: "China",
    description:
      "China is vast, with dynastic history, iconic landmarks and diverse regions.",
    heroImage: "/countries/china.jpg",
    highlights: [
      "Great Wall of China",
      "Terracotta Army in Xi'an",
      "Forbidden City Beijing",
      "Shanghai modern skyline",
      "Li River cruises Guilin",
      "Traditional Chinese gardens"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Great Wall", "Forbidden City", "Modern Towers"]
      },
      {
        category: "Shopping",
        items: ["Silk Markets", "Tea Shops", "Antiques"]
      },
      {
        category: "Entertainment",
        items: ["Acrobatic Shows", "River Cruises", "Theme Parks"]
      },
      {
        category: "Culture",
        items: ["Museums", "Temples", "Traditional Shows"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Ancient sites and culture"
      },
      {
        type: "shopping",
        description: "Regional cuisines"
      },
      {
        type: "adventure",
        description: "Wall hiking"
      },
      {
        type: "luxury",
        description: "Modern metropolises"
      }
    ],
    bestTimeToVisit: "Apr-May, Sep-Oct",
    currency: "CNY (Renminbi)",
    language: "Mandarin"
  },

  greece: {
    id: "greece",
    name: "Greece",
    country: "Greece",
    description:
      "Greece combines ancient ruins, islands and Mediterranean cuisine.",
    heroImage: "/countries/greece.jpg",
    highlights: [
      "Acropolis and Parthenon",
      "Santorini sunsets and white villages",
      "Mykonos beaches and nightlife",
      "Delphi ancient ruins",
      "Greek island hopping",
      "Traditional Greek tavernas"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Acropolis", "Ancient Theaters", "Byzantine Churches"]
      },
      {
        category: "Shopping",
        items: ["Local Markets", "Olive Oil", "Handmade Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Island Cruises", "Beach Clubs", "Traditional Dance"]
      },
      {
        category: "Culture",
        items: ["Archaeological Sites", "Museums", "Monasteries"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Classical ruins"
      },
      {
        type: "adventure",
        description: "Island hopping"
      },
      {
        type: "shopping",
        description: "Mediterranean cuisine"
      },
      {
        type: "luxury",
        description: "Santorini sunsets"
      }
    ],
    bestTimeToVisit: "May to Oct",
    currency: "EUR (Euro)",
    language: "Greek"
  },

  germany: {
    id: "germany",
    name: "Germany",
    country: "Germany",
    description:
      "Germany offers historic cities, alpine scenery and strong cultural traditions.",
    heroImage: "/countries/germany.webp",
    highlights: [
      "Berlin Wall and Brandenburg Gate",
      "Bavarian Alps and Neuschwanstein",
      "Munich beer gardens",
      "Rhine Valley castles",
      "Black Forest scenic drives",
      "Christmas markets"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Castles", "Cathedrals", "Modern Berlin"]
      },
      {
        category: "Shopping",
        items: ["Christmas Markets", "Designer Stores", "Local Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Oktoberfest", "Beer Gardens", "Classical Music"]
      },
      {
        category: "Culture",
        items: ["Museums", "Historic Sites", "Art Galleries"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Castles and museums"
      },
      {
        type: "shopping",
        description: "Oktoberfest and markets"
      },
      {
        type: "adventure",
        description: "Alps and forests"
      },
      {
        type: "luxury",
        description: "Art and music"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "EUR (Euro)",
    language: "German"
  },

  netherlands: {
    id: "netherlands",
    name: "Netherlands",
    country: "Netherlands",
    description:
      "The Netherlands is known for canals, cycling, tulips and compact, walkable cities.",
    heroImage: "/countries/netherlands.avif",
    highlights: [
      "Amsterdam canal cruises",
      "Keukenhof tulip gardens",
      "Windmills of Kinderdijk",
      "Anne Frank House",
      "Van Gogh Museum",
      "Cycling through countryside"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Canal Houses", "Windmills", "Modern Design"]
      },
      {
        category: "Shopping",
        items: ["Flower Markets", "Cheese Shops", "Boutiques"]
      },
      {
        category: "Entertainment",
        items: ["Canal Cruises", "Museums", "Cycling Tours"]
      },
      {
        category: "Culture",
        items: ["Art Museums", "Historic Sites", "Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Museums and galleries"
      },
      {
        type: "adventure",
        description: "Bike-friendly routes"
      },
      {
        type: "shopping",
        description: "Tulips and windmills"
      },
      {
        type: "luxury",
        description: "Amsterdam charm"
      }
    ],
    bestTimeToVisit: "April to May, Sep to Oct",
    currency: "EUR (Euro)",
    language: "Dutch"
  },

  "saudi-arabia": {
    id: "saudi-arabia",
    name: "Saudi Arabia",
    country: "Saudi Arabia",
    description:
      "Saudi Arabia offers historic sites, Red Sea coastlines and desert landscapes.",
    heroImage: "/countries/saudi.jpg",
    highlights: [
      "AlUla ancient rock formations",
      "Red Sea diving and beaches",
      "Riyadh modern architecture",
      "Madain Saleh archaeological site",
      "Edge of the World cliff views",
      "Traditional Souq experiences"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Historic AlUla", "Modern Riyadh", "Traditional Forts"]
      },
      {
        category: "Shopping",
        items: ["Souqs", "Malls", "Traditional Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Desert Adventures", "Water Sports", "Cultural Shows"]
      },
      {
        category: "Culture",
        items: ["Archaeological Sites", "Museums", "Heritage Villages"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Heritage and archaeology"
      },
      {
        type: "adventure",
        description: "Diving and desert"
      },
      {
        type: "shopping",
        description: "Ancient sites"
      },
      {
        type: "luxury",
        description: "Red Sea resorts"
      }
    ],
    bestTimeToVisit: "Nov to Mar",
    currency: "SAR (Saudi Riyal)",
    language: "Arabic"
  },

  vietnam: {
    id: "vietnam",
    name: "Vietnam",
    country: "Vietnam",
    description:
      "Vietnam stretches from rice terraces to vibrant cities and tropical coasts.",
    heroImage: "/countries/vietnam.webp",
    highlights: [
      "Ha Long Bay cruises",
      "Hanoi street food scene",
      "Hoi An ancient town",
      "Sapa rice terraces",
      "Mekong Delta tours",
      "Ho Chi Minh City energy"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Ancient Towns", "Temples", "French Colonial"]
      },
      {
        category: "Shopping",
        items: ["Night Markets", "Tailor Shops", "Handicrafts"]
      },
      {
        category: "Entertainment",
        items: ["Water Puppets", "Cooking Classes", "Boat Tours"]
      },
      {
        category: "Culture",
        items: ["Historic Sites", "Museums", "Local Markets"]
      }
    ],
    suitedFor: [
      {
        type: "shopping",
        description: "Affordable travel with rich experiences"
      },
      {
        type: "family",
        description: "Street food and regional specialties"
      },
      {
        type: "adventure",
        description: "Trekking and cruises"
      },
      {
        type: "luxury",
        description: "Ancient heritage"
      }
    ],
    bestTimeToVisit: "Feb to Apr, Sep to Nov",
    currency: "VND (Vietnamese Dong)",
    language: "Vietnamese"
  },

  india: {
    id: "india",
    name: "India",
    country: "India",
    description:
      "India offers vast cultural diversity, historic sites and varied landscapes.",
    heroImage: "/countries/india.jpg",
    highlights: [
      "Taj Mahal wonder of the world",
      "Rajasthan forts and palaces",
      "Kerala backwaters and houseboats",
      "Varanasi spiritual experiences",
      "Goa beaches and Portuguese heritage",
      "Himalayan mountain treks"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Taj Mahal", "Amber Fort", "Temples"]
      },
      {
        category: "Shopping",
        items: ["Bazaars", "Textiles", "Handicrafts"]
      },
      {
        category: "Entertainment",
        items: ["Cultural Shows", "Festivals", "Bollywood"]
      },
      {
        category: "Culture",
        items: ["Temples", "Palaces", "Historic Sites"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Temples, palaces and festivals"
      },
      {
        type: "shopping",
        description: "Regional cuisines"
      },
      {
        type: "adventure",
        description: "Spiritual travelers"
      },
      {
        type: "luxury",
        description: "Historic monuments"
      }
    ],
    bestTimeToVisit: "Oct to Mar",
    currency: "INR (Indian Rupee)",
    language: "Hindi, English"
  },

  singapore: {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    description:
      "City-state with urban nature, world-class dining and family attractions.",
    heroImage: "/countries/singapore.webp",
    highlights: [
      "Marina Bay Sands and skyline",
      "Gardens by the Bay Supertrees",
      "Sentosa Island attractions",
      "Hawker center food culture",
      "Universal Studios theme park",
      "Night Safari wildlife experience"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Marina Bay", "Gardens by the Bay", "Modern Towers"]
      },
      {
        category: "Shopping",
        items: ["Orchard Road", "Malls", "Markets"]
      },
      {
        category: "Entertainment",
        items: ["Universal Studios", "Night Safari", "Sentosa"]
      },
      {
        category: "Culture",
        items: ["Museums", "Cultural Quarters", "Temples"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Safe attractions and parks"
      },
      {
        type: "shopping",
        description: "Hawker cuisine"
      },
      {
        type: "luxury",
        description: "Modern city experiences"
      },
      {
        type: "adventure",
        description: "World-class malls"
      }
    ],
    bestTimeToVisit: "Feb to Apr",
    currency: "SGD (Singapore Dollar)",
    language: "English, Mandarin"
  },

  "south-africa": {
    id: "south-africa",
    name: "South Africa",
    country: "South Africa",
    description:
      "South Africa is renowned for safaris, dramatic coastlines and vibrant cities.",
    heroImage: "/countries/southafrica.jpg",
    highlights: [
      "Kruger National Park safaris",
      "Cape Town and Table Mountain",
      "Garden Route scenic drive",
      "Wine lands of Stellenbosch",
      "Robben Island historic site",
      "Diverse wildlife viewing"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Cape Dutch", "Modern Cape Town", "Historic Sites"]
      },
      {
        category: "Shopping",
        items: ["Craft Markets", "Wine Estates", "Malls"]
      },
      {
        category: "Entertainment",
        items: ["Safari Drives", "Wine Tours", "Beach Activities"]
      },
      {
        category: "Culture",
        items: ["Museums", "Township Tours", "Art Galleries"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Big Five and private reserves"
      },
      {
        type: "family",
        description: "Vineyard tours"
      },
      {
        type: "shopping",
        description: "Hiking and drives"
      },
      {
        type: "luxury",
        description: "Coastal beauty"
      }
    ],
    bestTimeToVisit: "Apr to Sep",
    currency: "ZAR (South African Rand)",
    language: "Multiple (English widely used)"
  },

  australia: {
    id: "australia",
    name: "Australia",
    country: "Australia",
    description:
      "Australia features reefs, coasts, Outback and cosmopolitan cities.",
    heroImage: "/countries/australia.webp",
    highlights: [
      "Great Barrier Reef diving",
      "Sydney Opera House and Harbour",
      "Uluru (Ayers Rock) in Outback",
      "Melbourne cultural scene",
      "Coastal drives and beaches",
      "Unique wildlife encounters"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Sydney Opera House", "Modern Cities", "Historic Sites"]
      },
      {
        category: "Shopping",
        items: ["Markets", "Designer Stores", "Aboriginal Art"]
      },
      {
        category: "Entertainment",
        items: ["Wildlife Parks", "Surfing", "Wine Tours"]
      },
      {
        category: "Culture",
        items: ["Aboriginal Culture", "Museums", "Art Galleries"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Surfing and coastal escapes"
      },
      {
        type: "family",
        description: "Diving and outback trips"
      },
      {
        type: "shopping",
        description: "Unique fauna"
      },
      {
        type: "luxury",
        description: "Sydney and Melbourne"
      }
    ],
    bestTimeToVisit: "Sep to Nov, Mar to May",
    currency: "AUD (Australian Dollar)",
    language: "English"
  },

  "new-zealand": {
    id: "new-zealand",
    name: "New Zealand",
    country: "New Zealand",
    description:
      "New Zealand is famed for fjords, mountains and compact, dramatic scenery.",
    heroImage: "/countries/newzealand.webp",
    highlights: [
      "Milford Sound fjord cruises",
      "Queenstown adventure sports",
      "Hobbiton movie set tours",
      "Tongariro Alpine Crossing",
      "Rotorua geothermal wonders",
      "Maori cultural experiences"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: [
          "Historic Buildings",
          "Maori Meeting Houses",
          "Modern Design"
        ]
      },
      {
        category: "Shopping",
        items: ["Wool Products", "Jade", "Local Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Bungee Jumping", "Rafting", "Hiking"]
      },
      {
        category: "Culture",
        items: ["Maori Culture", "Museums", "Film Locations"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Multi-activity trips"
      },
      {
        type: "family",
        description: "Photography and road trips"
      },
      {
        type: "shopping",
        description: "Lord of the Rings tours"
      },
      {
        type: "luxury",
        description: "Scenic trails"
      }
    ],
    bestTimeToVisit: "Oct to Apr",
    currency: "NZD (New Zealand Dollar)",
    language: "English, Māori"
  },

  canada: {
    id: "canada",
    name: "Canada",
    country: "Canada",
    description:
      "Canada offers vast wilderness, national parks and diverse cities.",
    heroImage: "/countries/canada.webp",
    highlights: [
      "Canadian Rockies and Banff",
      "Niagara Falls wonder",
      "Vancouver urban nature",
      "Quebec City European charm",
      "Northern lights viewing",
      "Wildlife in natural habitat"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Historic Quebec", "Modern Vancouver", "Parliament Hill"]
      },
      {
        category: "Shopping",
        items: ["Markets", "Malls", "Indigenous Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Skiing", "Hiking", "Wildlife Tours"]
      },
      {
        category: "Culture",
        items: ["Museums", "Historic Sites", "Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Hiking and skiing"
      },
      {
        type: "family",
        description: "Scenic drives"
      },
      {
        type: "shopping",
        description: "Mountains and wildlife"
      },
      {
        type: "luxury",
        description: "Vancouver and Toronto"
      }
    ],
    bestTimeToVisit: "Jun to Sep",
    currency: "CAD (Canadian Dollar)",
    language: "English, French"
  },

  malaysia: {
    id: "malaysia",
    name: "Malaysia",
    country: "Malaysia",
    description:
      "Malaysia combines cities, islands and rainforest biodiversity.",
    heroImage: "/countries/malaysia.webp",
    highlights: [
      "Kuala Lumpur Petronas Towers",
      "Penang street food capital",
      "Borneo rainforests and wildlife",
      "Langkawi island beaches",
      "Cameron Highlands tea plantations",
      "Multi-cultural heritage sites"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Petronas Towers", "Colonial Buildings", "Temples"]
      },
      {
        category: "Shopping",
        items: ["Night Markets", "Malls", "Local Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Island Hopping", "Jungle Treks", "Cultural Shows"]
      },
      {
        category: "Culture",
        items: ["Multi-cultural Sites", "Museums", "Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "shopping",
        description: "Culinary variety"
      },
      {
        type: "adventure",
        description: "Rainforest and wildlife"
      },
      {
        type: "family",
        description: "Tropical islands"
      },
      {
        type: "luxury",
        description: "Modern Kuala Lumpur"
      }
    ],
    bestTimeToVisit: "Mar to Oct",
    currency: "MYR (Malaysian Ringgit)",
    language: "Malay, English"
  },

  "south-korea": {
    id: "south-korea",
    name: "South Korea",
    country: "South Korea",
    description:
      "South Korea offers high-energy cities, coastal islands and mountain trails.",
    heroImage: "/countries/southkorea.jpg",
    highlights: [
      "Seoul modern metropolis",
      "Jeju Island natural beauty",
      "Korean BBQ and street food",
      "Gyeongbokgung Palace",
      "Busan beaches and markets",
      "K-pop and entertainment culture"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Palaces", "Modern Seoul", "Temples"]
      },
      {
        category: "Shopping",
        items: ["Myeongdong", "Markets", "K-beauty Stores"]
      },
      {
        category: "Entertainment",
        items: ["K-pop Shows", "Theme Parks", "Jjimjilbangs"]
      },
      {
        category: "Culture",
        items: ["Palaces", "Museums", "Traditional Villages"]
      }
    ],
    suitedFor: [
      {
        type: "shopping",
        description: "Korean BBQ and markets"
      },
      {
        type: "family",
        description: "Palaces and temples"
      },
      {
        type: "adventure",
        description: "K-pop and entertainment"
      },
      {
        type: "luxury",
        description: "Modern Seoul"
      }
    ],
    bestTimeToVisit: "Mar to May, Sep to Nov",
    currency: "KRW (Korean Won)",
    language: "Korean"
  },

  morocco: {
    id: "morocco",
    name: "Morocco",
    country: "Morocco",
    description:
      "Morocco is known for medinas, desert landscapes and Atlas mountain scenery.",
    heroImage: "/countries/morocco.avif",
    highlights: [
      "Marrakech souks and Jemaa el-Fnaa",
      "Sahara Desert camel treks",
      "Fes medieval medina",
      "Atlas Mountains hiking",
      "Chefchaouen blue city",
      "Traditional riads and hammams"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Medinas", "Mosques", "Kasbahs"]
      },
      {
        category: "Shopping",
        items: ["Souks", "Carpets", "Leather Goods"]
      },
      {
        category: "Entertainment",
        items: ["Desert Tours", "Cooking Classes", "Traditional Music"]
      },
      {
        category: "Culture",
        items: ["Medinas", "Museums", "Traditional Crafts"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Medinas and markets"
      },
      {
        type: "adventure",
        description: "Desert treks"
      },
      {
        type: "shopping",
        description: "Souks and handicrafts"
      },
      {
        type: "luxury",
        description: "Moroccan cuisine"
      }
    ],
    bestTimeToVisit: "Mar to May, Sep to Nov",
    currency: "MAD (Moroccan Dirham)",
    language: "Arabic, French"
  },

  egypt: {
    id: "egypt",
    name: "Egypt",
    country: "Egypt",
    description:
      "Egypt is home to millennia-old monuments, Nile cruises and Red Sea diving.",
    heroImage: "/countries/egypt.avif",
    highlights: [
      "Pyramids of Giza and Sphinx",
      "Luxor temples and Valley of the Kings",
      "Nile River cruises",
      "Cairo Egyptian Museum",
      "Red Sea diving and resorts",
      "Abu Simbel temples"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Pyramids", "Temples", "Mosques"]
      },
      {
        category: "Shopping",
        items: ["Khan el-Khalili", "Bazaars", "Papyrus Shops"]
      },
      {
        category: "Entertainment",
        items: ["Nile Cruises", "Sound & Light Shows", "Diving"]
      },
      {
        category: "Culture",
        items: ["Museums", "Archaeological Sites", "Historic Landmarks"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Archaeological exploration"
      },
      {
        type: "adventure",
        description: "Desert and diving"
      },
      {
        type: "shopping",
        description: "Culture enthusiasts"
      },
      {
        type: "luxury",
        description: "Nile journeys"
      }
    ],
    bestTimeToVisit: "Oct to Apr",
    currency: "EGP (Egyptian Pound)",
    language: "Arabic"
  },

  tunisia: {
    id: "tunisia",
    name: "Tunisia",
    country: "Tunisia",
    description:
      "Tunisia mixes Mediterranean beaches, Roman ruins and Sahara oases.",
    heroImage: "/countries/tunisia.webp",
    highlights: [
      "Carthage ancient ruins",
      "El Djem Roman amphitheater",
      "Djerba island beaches",
      "Sidi Bou Said blue and white town",
      "Sahara desert experiences",
      "Medinas of Tunis and Sousse"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Roman Ruins", "Medinas", "Mosques"]
      },
      {
        category: "Shopping",
        items: ["Markets", "Handicrafts", "Pottery"]
      },
      {
        category: "Entertainment",
        items: ["Beach Resorts", "Desert Tours", "Cultural Events"]
      },
      {
        category: "Culture",
        items: ["Archaeological Sites", "Museums", "Traditional Towns"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Mediterranean coast"
      },
      {
        type: "family",
        description: "Roman and ancient sites"
      },
      {
        type: "shopping",
        description: "Medinas and traditions"
      },
      {
        type: "luxury",
        description: "Sahara adventures"
      }
    ],
    bestTimeToVisit: "Mar to May, Sep to Oct",
    currency: "TND (Tunisian Dinar)",
    language: "Arabic, French"
  },

  qatar: {
    id: "qatar",
    name: "Qatar",
    country: "Qatar",
    description:
      "Qatar mixes modern architecture, museums and desert experiences.",
    heroImage: "/countries/qatar.jpg",
    highlights: [
      "Museum of Islamic Art",
      "Souq Waqif traditional market",
      "Doha Corniche waterfront",
      "Desert safari adventures",
      "The Pearl-Qatar luxury island",
      "Katara Cultural Village"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Modern Towers", "Museums", "Traditional Forts"]
      },
      {
        category: "Shopping",
        items: ["Souq Waqif", "Malls", "Luxury Boutiques"]
      },
      {
        category: "Entertainment",
        items: ["Desert Safaris", "Water Sports", "Cultural Shows"]
      },
      {
        category: "Culture",
        items: ["Museums", "Art Galleries", "Heritage Sites"]
      }
    ],
    suitedFor: [
      {
        type: "luxury",
        description: "Modern hotels and dining"
      },
      {
        type: "family",
        description: "Museums and galleries"
      },
      {
        type: "shopping",
        description: "Souqs and malls"
      },
      {
        type: "adventure",
        description: "Safari experiences"
      }
    ],
    bestTimeToVisit: "Nov to Apr",
    currency: "QAR (Qatari Riyal)",
    language: "Arabic, English"
  },

  jordan: {
    id: "jordan",
    name: "Jordan",
    country: "Jordan",
    description:
      "Jordan is famed for Petra, Wadi Rum and the Dead Sea's unique experiences.",
    heroImage: "/countries/jordan.webp",
    highlights: [
      "Petra ancient city",
      "Wadi Rum desert landscapes",
      "Dead Sea floating experience",
      "Jerash Roman ruins",
      "Aqaba Red Sea diving",
      "Amman citadel and culture"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Petra", "Roman Ruins", "Castles"]
      },
      {
        category: "Shopping",
        items: ["Souqs", "Handicrafts", "Dead Sea Products"]
      },
      {
        category: "Entertainment",
        items: ["Desert Tours", "Diving", "Hot Air Balloons"]
      },
      {
        category: "Culture",
        items: ["Archaeological Sites", "Museums", "Bedouin Culture"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Archaeological sites"
      },
      {
        type: "adventure",
        description: "Desert tours"
      },
      {
        type: "shopping",
        description: "Petra and hiking"
      },
      {
        type: "luxury",
        description: "Dead Sea resorts"
      }
    ],
    bestTimeToVisit: "Mar to May, Sep to Nov",
    currency: "JOD (Jordanian Dinar)",
    language: "Arabic, English"
  },

  czechia: {
    id: "czechia",
    name: "Czechia",
    country: "Czechia",
    description:
      "Czechia (Prague) offers medieval architecture, castles and a rich cultural scene.",
    heroImage: "/countries/czechia.jpeg",
    highlights: [
      "Prague Castle and Charles Bridge",
      "Old Town Square and Astronomical Clock",
      "Český Krumlov fairy tale town",
      "Czech beer culture and breweries",
      "Bohemian Forest nature",
      "Gothic and Baroque architecture"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Castles", "Gothic Churches", "Historic Squares"]
      },
      {
        category: "Shopping",
        items: ["Bohemian Crystal", "Markets", "Antiques"]
      },
      {
        category: "Entertainment",
        items: ["Classical Music", "Beer Tours", "River Cruises"]
      },
      {
        category: "Culture",
        items: ["Museums", "Galleries", "Historic Sites"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Castles and old towns"
      },
      {
        type: "shopping",
        description: "Brewery tours"
      },
      {
        type: "adventure",
        description: "Culture seekers"
      },
      {
        type: "luxury",
        description: "Medieval buildings"
      }
    ],
    bestTimeToVisit: "Apr to Oct",
    currency: "CZK (Czech Koruna)",
    language: "Czech"
  },

  poland: {
    id: "poland",
    name: "Poland",
    country: "Poland",
    description:
      "Poland features historic cities, mountain ranges and Baltic coastlines.",
    heroImage: "/countries/poland.avif",
    highlights: [
      "Kraków Old Town and Wawel Castle",
      "Warsaw rebuilt city center",
      "Auschwitz-Birkenau memorial",
      "Tatra Mountains hiking",
      "Wieliczka Salt Mine",
      "Baltic Sea beaches"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Castles", "Old Towns", "Churches"]
      },
      {
        category: "Shopping",
        items: ["Markets", "Amber Jewelry", "Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Mountain Hiking", "City Tours", "Cultural Events"]
      },
      {
        category: "Culture",
        items: ["Museums", "Historic Sites", "Memorial Sites"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Medieval towns and heritage"
      },
      {
        type: "adventure",
        description: "Hiking and lakes"
      },
      {
        type: "shopping",
        description: "Museums and sites"
      },
      {
        type: "luxury",
        description: "City explorers"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "PLN (Polish Zloty)",
    language: "Polish"
  },

  hungary: {
    id: "hungary",
    name: "Hungary",
    country: "Hungary",
    description:
      "Hungary centers on Budapest's thermal baths, Danube views and historic architecture.",
    heroImage: "/countries/hungary.jpg",
    highlights: [
      "Budapest thermal baths",
      "Parliament Building on Danube",
      "Buda Castle and Fisherman's Bastion",
      "Ruin bars nightlife",
      "Lake Balaton resorts",
      "Hungarian wine regions"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Parliament", "Castles", "Basilicas"]
      },
      {
        category: "Shopping",
        items: ["Markets", "Porcelain", "Wine"]
      },
      {
        category: "Entertainment",
        items: ["Thermal Baths", "River Cruises", "Ruin Bars"]
      },
      {
        category: "Culture",
        items: ["Museums", "Opera Houses", "Historic Sites"]
      }
    ],
    suitedFor: [
      {
        type: "luxury",
        description: "Spa and thermal experiences"
      },
      {
        type: "family",
        description: "Architecture and cuisine"
      },
      {
        type: "shopping",
        description: "Ruin bars"
      },
      {
        type: "adventure",
        description: "City visitors"
      }
    ],
    bestTimeToVisit: "Apr to Oct",
    currency: "HUF (Hungarian Forint)",
    language: "Hungarian"
  },

  croatia: {
    id: "croatia",
    name: "Croatia",
    country: "Croatia",
    description:
      "Croatia is famed for Adriatic coastlines, medieval towns and island hopping.",
    heroImage: "/countries/coratia.jpg",
    highlights: [
      "Dubrovnik Old Town walls",
      "Plitvice Lakes National Park",
      "Hvar island beaches and nightlife",
      "Split and Diocletian's Palace",
      "Istrian peninsula and truffle region",
      "Dalmatian Coast sailing"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Medieval Towns", "Roman Ruins", "Churches"]
      },
      {
        category: "Shopping",
        items: ["Local Markets", "Olive Oil", "Wine"]
      },
      {
        category: "Entertainment",
        items: ["Sailing", "Beach Clubs", "Island Hopping"]
      },
      {
        category: "Culture",
        items: ["Historic Sites", "Museums", "Traditional Villages"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Beaches and sailing"
      },
      {
        type: "family",
        description: "Medieval towns"
      },
      {
        type: "shopping",
        description: "Adriatic coast"
      },
      {
        type: "luxury",
        description: "National parks"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "EUR (Euro)",
    language: "Croatian"
  },

  belgium: {
    id: "belgium",
    name: "Belgium",
    country: "Belgium",
    description:
      "Belgium offers historic cities, chocolate, beer culture and UNESCO towns.",
    heroImage: "/countries/belgium.jpg",
    highlights: [
      "Brussels Grand Place and Manneken Pis",
      "Bruges medieval canals",
      "Belgian chocolate and waffles",
      "Beer culture and breweries",
      "Ghent historic center",
      "Antwerp diamond district"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Grand Place", "Belfries", "Art Nouveau"]
      },
      {
        category: "Shopping",
        items: ["Chocolate Shops", "Markets", "Diamonds"]
      },
      {
        category: "Entertainment",
        items: ["Beer Tours", "Canal Cruises", "Museums"]
      },
      {
        category: "Culture",
        items: ["Art Museums", "Historic Centers", "Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "shopping",
        description: "Chocolate and beer"
      },
      {
        type: "family",
        description: "Compact historic cities"
      },
      {
        type: "adventure",
        description: "Art and history"
      },
      {
        type: "luxury",
        description: "Medieval charm"
      }
    ],
    bestTimeToVisit: "Apr to Oct",
    currency: "EUR (Euro)",
    language: "Dutch, French, German"
  },

  ireland: {
    id: "ireland",
    name: "Ireland",
    country: "Ireland",
    description:
      "Ireland features green landscapes, dramatic coasts and lively cultural pubs.",
    heroImage: "/countries/ireland.webp",
    highlights: [
      "Cliffs of Moher dramatic views",
      "Dublin pubs and Temple Bar",
      "Ring of Kerry scenic drive",
      "Galway cultural vibrancy",
      "Giant's Causeway formations",
      "Traditional Irish music sessions"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Castles", "Abbeys", "Georgian Dublin"]
      },
      {
        category: "Shopping",
        items: ["Woolen Goods", "Whiskey", "Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Traditional Music", "Pub Culture", "Coastal Drives"]
      },
      {
        category: "Culture",
        items: ["Museums", "Literary Sites", "Historic Landmarks"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Coastal drives and cliffs"
      },
      {
        type: "family",
        description: "Pub and music scene"
      },
      {
        type: "shopping",
        description: "Scenic routes"
      },
      {
        type: "luxury",
        description: "Dublin heritage"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "EUR (Euro)",
    language: "English, Irish"
  },

  denmark: {
    id: "denmark",
    name: "Denmark",
    country: "Denmark",
    description:
      "Denmark mixes hygge culture, coastal islands and modern Copenhagen design.",
    heroImage: "/countries/denmark.jpg",
    highlights: [
      "Copenhagen Nyhavn and Tivoli",
      "Little Mermaid statue",
      "Danish design and architecture",
      "Legoland family fun",
      "Hygge lifestyle experiences",
      "Coastal islands and beaches"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Modern Design", "Palaces", "Colorful Houses"]
      },
      {
        category: "Shopping",
        items: ["Design Stores", "Markets", "Danish Products"]
      },
      {
        category: "Entertainment",
        items: ["Tivoli Gardens", "Museums", "Cycling Tours"]
      },
      {
        category: "Culture",
        items: ["Design Museums", "Historic Sites", "Art Galleries"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Legoland and Tivoli"
      },
      {
        type: "shopping",
        description: "Design lovers"
      },
      {
        type: "adventure",
        description: "Bike-friendly cities"
      },
      {
        type: "luxury",
        description: "New Nordic cuisine"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "DKK (Danish Krone)",
    language: "Danish"
  },

  sweden: {
    id: "sweden",
    name: "Sweden",
    country: "Sweden",
    description:
      "Sweden has expansive forests, archipelagos and modern Scandinavian cities.",
    heroImage: "/countries/sweden.webp",
    highlights: [
      "Stockholm archipelago beauty",
      "Gamla Stan old town",
      "Icehotel unique experience",
      "Northern lights in Lapland",
      "Abba Museum and culture",
      "Swedish fika tradition"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Royal Palace", "Modern Design", "Historic Towns"]
      },
      {
        category: "Shopping",
        items: ["Design Stores", "Markets", "Swedish Brands"]
      },
      {
        category: "Entertainment",
        items: ["Archipelago Tours", "Northern Lights", "Museums"]
      },
      {
        category: "Culture",
        items: ["Viking History", "Museums", "Music Heritage"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Outdoor and archipelago trips"
      },
      {
        type: "family",
        description: "Stockholm charm"
      },
      {
        type: "shopping",
        description: "Scandinavian design"
      },
      {
        type: "luxury",
        description: "Northern lights"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "SEK (Swedish Krona)",
    language: "Swedish"
  },

  norway: {
    id: "norway",
    name: "Norway",
    country: "Norway",
    description:
      "Norway is known for fjords, northern lights and dramatic coastal scenery.",
    heroImage: "/countries/Norway.jpg",
    highlights: [
      "Fjord cruises and Geirangerfjord",
      "Northern lights viewing",
      "Bergen colorful Bryggen wharf",
      "Lofoten Islands scenery",
      "Oslo modern and historic blend",
      "Midnight sun experiences"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Stave Churches", "Modern Oslo", "Colorful Towns"]
      },
      {
        category: "Shopping",
        items: ["Wool Products", "Crafts", "Norwegian Design"]
      },
      {
        category: "Entertainment",
        items: ["Fjord Cruises", "Hiking", "Northern Lights"]
      },
      {
        category: "Culture",
        items: ["Viking Museums", "Art Galleries", "Historic Sites"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Fjords and northern lights"
      },
      {
        type: "family",
        description: "Mountains and coast"
      },
      {
        type: "shopping",
        description: "Photographers"
      },
      {
        type: "luxury",
        description: "Fjord journeys"
      }
    ],
    bestTimeToVisit:
      "Jun to Aug (summer), Sep to Mar (aurora)",
    currency: "NOK (Norwegian Krone)",
    language: "Norwegian"
  },

  romania: {
    id: "romania",
    name: "Romania",
    country: "Romania",
    description:
      "Romania offers castles, Transylvanian landscapes and Black Sea coasts.",
    heroImage: "/countries/romania.jpg",
    highlights: [
      "Bran Castle (Dracula's Castle)",
      "Carpathian Mountains hiking",
      "Bucharest Palace of Parliament",
      "Transylvania medieval towns",
      "Painted monasteries of Bucovina",
      "Danube Delta wildlife"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Castles", "Monasteries", "Medieval Towns"]
      },
      {
        category: "Shopping",
        items: ["Crafts", "Markets", "Traditional Items"]
      },
      {
        category: "Entertainment",
        items: ["Hiking", "Wine Tours", "Rural Stays"]
      },
      {
        category: "Culture",
        items: ["Historic Sites", "Museums", "Folklore"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Medieval heritage"
      },
      {
        type: "adventure",
        description: "Hiking and rural exploration"
      },
      {
        type: "shopping",
        description: "Nature lovers"
      },
      {
        type: "luxury",
        description: "Historic towns"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "RON (Romanian Leu)",
    language: "Romanian"
  },

  bulgaria: {
    id: "bulgaria",
    name: "Bulgaria",
    country: "Bulgaria",
    description:
      "Bulgaria features Black Sea beaches, ski resorts and historic towns.",
    heroImage: "/countries/bulgaria.jpg",
    highlights: [
      "Sunny Beach Black Sea resort",
      "Bansko ski slopes",
      "Sofia historic capital",
      "Plovdiv ancient city",
      "Rila Monastery UNESCO site",
      "Rose Valley and products"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Monasteries", "Roman Ruins", "Orthodox Churches"]
      },
      {
        category: "Shopping",
        items: ["Rose Products", "Markets", "Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Skiing", "Beach Resorts", "Hiking"]
      },
      {
        category: "Culture",
        items: ["Museums", "Historic Sites", "Traditional Villages"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Affordable seaside resorts"
      },
      {
        type: "family",
        description: "Ski resorts"
      },
      {
        type: "shopping",
        description: "Ancient sites"
      },
      {
        type: "luxury",
        description: "Affordable Europe"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "BGN (Bulgarian Lev)",
    language: "Bulgarian"
  },

  "dominican-republic": {
    id: "dominican-republic",
    name: "Dominican Republic",
    country: "Dominican Republic",
    description:
      "Caribbean beaches, all-inclusive resorts and vibrant culture define the Dominican Republic.",
    heroImage: "/countries/dominican.jpg",
    highlights: [
      "Punta Cana pristine beaches",
      "Santo Domingo colonial zone",
      "Samaná Peninsula whale watching",
      "All-inclusive beach resorts",
      "Merengue and bachata music",
      "Water sports and diving"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Colonial Buildings", "Churches", "Historic Zones"]
      },
      {
        category: "Shopping",
        items: ["Markets", "Rum", "Cigars"]
      },
      {
        category: "Entertainment",
        items: ["Water Sports", "Golf", "Beach Clubs"]
      },
      {
        category: "Culture",
        items: ["Music and Dance", "Museums", "Local Culture"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Resorts and water sports"
      },
      {
        type: "family",
        description: "All-inclusive resorts"
      },
      {
        type: "shopping",
        description: "Diving and surfing"
      },
      {
        type: "luxury",
        description: "Beach paradise"
      }
    ],
    bestTimeToVisit: "Dec to Apr",
    currency: "DOP (Dominican Peso)",
    language: "Spanish"
  },

  cuba: {
    id: "cuba",
    name: "Cuba",
    country: "Cuba",
    description:
      "Cuba is known for vintage cars, vibrant music, historic Havana and Caribbean beaches.",
    heroImage: "/countries/cuba.jpg",
    highlights: [
      "Havana colonial architecture",
      "Vintage car tours",
      "Varadero white sand beaches",
      "Trinidad colonial town",
      "Cuban cigars and rum",
      "Salsa music and dance"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Colonial Buildings", "Art Deco", "Colorful Streets"]
      },
      {
        category: "Shopping",
        items: ["Cigars", "Rum", "Local Art"]
      },
      {
        category: "Entertainment",
        items: ["Live Music", "Dance Shows", "Beach Clubs"]
      },
      {
        category: "Culture",
        items: ["Museums", "Music Heritage", "Revolutionary Sites"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Music and colonial architecture"
      },
      {
        type: "adventure",
        description: "Caribbean coast"
      },
      {
        type: "shopping",
        description: "Salsa and culture"
      },
      {
        type: "luxury",
        description: "Colonial heritage"
      }
    ],
    bestTimeToVisit: "Nov to Apr",
    currency: "CUP/CUC",
    language: "Spanish"
  },

  brazil: {
    id: "brazil",
    name: "Brazil",
    country: "Brazil",
    description:
      "Brazil offers Amazon rainforest, iconic Rio festivals, and long Atlantic beaches.",
    heroImage: "/countries/brazil.jpg",
    highlights: [
      "Rio de Janeiro and Carnival",
      "Amazon Rainforest adventures",
      "Iguazu Falls wonder",
      "Copacabana and Ipanema beaches",
      "Salvador Bahia Afro-Brazilian culture",
      "Samba and bossa nova music"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Colonial Towns", "Modern Rio", "Churches"]
      },
      {
        category: "Shopping",
        items: ["Markets", "Gems", "Handicrafts"]
      },
      {
        category: "Entertainment",
        items: ["Carnival", "Samba Shows", "Beach Culture"]
      },
      {
        category: "Culture",
        items: ["Museums", "Music Heritage", "Indigenous Culture"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Rainforest and waterfalls"
      },
      {
        type: "family",
        description: "Carnival and music"
      },
      {
        type: "shopping",
        description: "Atlantic coast"
      },
      {
        type: "luxury",
        description: "Amazon and wildlife"
      }
    ],
    bestTimeToVisit: "May to Sep (varies by region)",
    currency: "BRL (Brazilian Real)",
    language: "Portuguese"
  },

  argentina: {
    id: "argentina",
    name: "Argentina",
    country: "Argentina",
    description:
      "Argentina mixes Buenos Aires culture, Patagonian landscapes and wine regions.",
    heroImage: "/countries/argentina.webp",
    highlights: [
      "Buenos Aires tango culture",
      "Patagonia glaciers and mountains",
      "Mendoza wine region",
      "Iguazu Falls Argentine side",
      "Ushuaia end of the world",
      "Argentinian steak and asado"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: [
          "European Style",
          "Colonial Buildings",
          "Modern Buenos Aires"
        ]
      },
      {
        category: "Shopping",
        items: ["Leather Goods", "Wine", "Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Tango Shows", "Wine Tours", "Glacier Cruises"]
      },
      {
        category: "Culture",
        items: ["Museums", "Tango Heritage", "Gaucho Culture"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Glaciers and mountains"
      },
      {
        type: "shopping",
        description: "Steak and wine"
      },
      {
        type: "family",
        description: "Dance and culture"
      },
      {
        type: "luxury",
        description: "Patagonian trails"
      }
    ],
    bestTimeToVisit: "Oct to Apr",
    currency: "ARS (Argentine Peso)",
    language: "Spanish"
  },

  portugal: {
    id: "portugal",
    name: "Portugal",
    country: "Portugal",
    description:
      "Portugal features coastal towns, historic Lisbon and Douro wine country.",
    heroImage: "/countries/portugal.jpg",
    highlights: [
      "Lisbon's hills and trams",
      "Porto wine cellars and river",
      "Algarve golden beaches",
      "Douro Valley wine tours",
      "Sintra palaces and castles",
      "Azores volcanic islands"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Azulejos Tiles", "Castles", "Monasteries"]
      },
      {
        category: "Shopping",
        items: ["Cork Products", "Wine", "Ceramics"]
      },
      {
        category: "Entertainment",
        items: ["Fado Music", "Wine Tours", "Beach Activities"]
      },
      {
        category: "Culture",
        items: ["Museums", "Historic Sites", "Maritime Heritage"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Coastal escapes"
      },
      {
        type: "shopping",
        description: "Douro and vineyards"
      },
      {
        type: "family",
        description: "Historic sites"
      },
      {
        type: "luxury",
        description: "Atlantic waves"
      }
    ],
    bestTimeToVisit: "Apr to Oct",
    currency: "EUR (Euro)",
    language: "Portuguese"
  },

  austria: {
    id: "austria",
    name: "Austria",
    country: "Austria",
    description:
      "Austria offers Alpine scenery, classical music heritage and charming cities.",
    heroImage: "/countries/austria.jpg",
    highlights: [
      "Vienna imperial palaces and opera",
      "Salzburg Mozart's birthplace",
      "Hallstatt picturesque village",
      "Alpine skiing and hiking",
      "Schönbrunn Palace gardens",
      "Classical music concerts"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Palaces", "Churches", "Alpine Villages"]
      },
      {
        category: "Shopping",
        items: ["Swarovski Crystal", "Markets", "Traditional Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Classical Concerts", "Skiing", "Opera"]
      },
      {
        category: "Culture",
        items: ["Museums", "Music Heritage", "Imperial History"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Classical music and palaces"
      },
      {
        type: "adventure",
        description: "Outdoor and skiing"
      },
      {
        type: "shopping",
        description: "Imperial heritage"
      },
      {
        type: "luxury",
        description: "Alpine trails"
      }
    ],
    bestTimeToVisit: "May to Sep",
    currency: "EUR (Euro)",
    language: "German"
  },

  mexico: {
    id: "mexico",
    name: "Mexico",
    country: "Mexico",
    description:
      "Mexico has rich heritage, beaches, and vibrant culinary and arts scenes.",
    heroImage: "/countries/mexico.avif",
    highlights: [
      "Cancún Caribbean beaches",
      "Mexico City museums and culture",
      "Mayan ruins Chichen Itza",
      "Playa del Carmen diving",
      "Oaxaca culinary traditions",
      "Day of the Dead celebrations"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Mayan Ruins", "Colonial Cities", "Modern Mexico City"]
      },
      {
        category: "Shopping",
        items: ["Crafts", "Textiles", "Silver"]
      },
      {
        category: "Entertainment",
        items: ["Beach Resorts", "Cenote Swimming", "Cultural Shows"]
      },
      {
        category: "Culture",
        items: ["Archaeological Sites", "Museums", "Traditional Festivals"]
      }
    ],
    suitedFor: [
      {
        type: "family",
        description: "Archaeology and cities"
      },
      {
        type: "adventure",
        description: "Caribbean coast"
      },
      {
        type: "shopping",
        description: "Authentic Mexican cuisine"
      },
      {
        type: "luxury",
        description: "Mayan heritage"
      }
    ],
    bestTimeToVisit: "Nov to Apr",
    currency: "MXN (Mexican Peso)",
    language: "Spanish"
  },

  spain: {
    id: "spain",
    name: "Spain",
    country: "Spain",
    description:
      "Spain offers diverse regions, tapas culture, historic cities and beaches.",
    heroImage: "/countries/spain.webp",
    highlights: [
      "Barcelona Gaudí architecture",
      "Madrid art museums Prado",
      "Andalusia flamenco and Moorish heritage",
      "Costa del Sol beaches",
      "Seville cathedral and culture",
      "San Sebastián culinary scene"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Sagrada Familia", "Alhambra", "Cathedrals"]
      },
      {
        category: "Shopping",
        items: ["Markets", "Fashion", "Local Crafts"]
      },
      {
        category: "Entertainment",
        items: ["Flamenco Shows", "Beach Clubs", "Festivals"]
      },
      {
        category: "Culture",
        items: ["Art Museums", "Historic Sites", "Bullfighting"]
      }
    ],
    suitedFor: [
      {
        type: "shopping",
        description: "Tapas and wine"
      },
      {
        type: "family",
        description: "Historic architecture"
      },
      {
        type: "adventure",
        description: "Mediterranean coast"
      },
      {
        type: "luxury",
        description: "Museums and galleries"
      }
    ],
    bestTimeToVisit: "May to Oct",
    currency: "EUR (Euro)",
    language: "Spanish"
  },

  switzerland: {
    id: "switzerland",
    name: "Switzerland",
    country: "Switzerland",
    description:
      "Switzerland offers breathtaking Alpine scenery, pristine lakes, charming villages and world-class skiing. Known for precision watches, chocolate and banking.",
    heroImage: "/countries/switzerland.jpg",
    highlights: [
      "Matterhorn iconic mountain peak",
      "Interlaken adventure sports hub",
      "Lake Geneva scenic beauty",
      "Zurich cosmopolitan city life",
      "Jungfraujoch Top of Europe",
      "Swiss chocolate and cheese tours"
    ],
    destinationHighlights: [
      {
        category: "Architecture",
        items: ["Chapel Bridge", "Chillon Castle", "Old Towns"]
      },
      {
        category: "Shopping",
        items: ["Swiss Watches", "Chocolate Shops", "Luxury Boutiques"]
      },
      {
        category: "Entertainment",
        items: ["Skiing", "Hiking", "Scenic Train Rides"]
      },
      {
        category: "Culture",
        items: ["Museums", "Festivals", "Traditional Villages"]
      }
    ],
    suitedFor: [
      {
        type: "adventure",
        description: "Alpine skiing and hiking"
      },
      {
        type: "luxury",
        description: "Premium resorts and spas"
      },
      {
        type: "family",
        description: "Scenic train journeys"
      },
      {
        type: "shopping",
        description: "Swiss watches and chocolate"
      }
    ],
    bestTimeToVisit: "Dec to Mar (skiing), June to Sep (hiking)",
    currency: "CHF (Swiss Franc)",
    language: "German, French, Italian, Romansh"
  }
};

