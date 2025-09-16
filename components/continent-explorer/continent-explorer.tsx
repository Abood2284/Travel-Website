"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";

interface DestinationItem {
  id: string;
  title: string;
  location: string;
  imageSrc: string;
  width: number;
  height: number;
}

type ContinentId =
  | "north-america"
  | "south-america"
  | "asia"
  | "europe"
  | "africa"
  | "oceania";

const CONTINENTS: { id: ContinentId; label: string }[] = [
  { id: "north-america", label: "North America" },
  { id: "south-america", label: "South America" },
  { id: "asia", label: "Asia" },
  { id: "europe", label: "Europe" },
  { id: "africa", label: "Africa" },
  { id: "oceania", label: "Oceania" },
];

const MOCK_DATA: Record<ContinentId, DestinationItem[]> = {
  "north-america": [
    {
      id: "hollywood",
      title: "HOLLYWOOD",
      location: "Los Angeles, USA",
      imageSrc: "/animations/images/image_120.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "beverly-hills",
      title: "BEVERLY HILLS",
      location: "Los Angeles, USA",
      imageSrc: "/animations/images/image_150.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "santa-monica",
      title: "SANTA MONICA",
      location: "Los Angeles, USA",
      imageSrc: "/animations/images/image_90.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "new-york",
      title: "NEW YORK",
      location: "New York City, USA",
      imageSrc: "/animations/images/image_30.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "las-vegas",
      title: "LAS VEGAS",
      location: "Nevada, USA",
      imageSrc: "/animations/images/image_20.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "banff",
      title: "BANFF NATIONAL PARK",
      location: "Alberta, Canada",
      imageSrc: "/animations/images/image_210.webp",
      width: 1600,
      height: 1067,
    },
  ],
  "south-america": [
    {
      id: "rio",
      title: "RIO DE JANEIRO",
      location: "Brazil",
      imageSrc: "/animations/images/image_60.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "machu-picchu",
      title: "MACHU PICCHU",
      location: "Peru",
      imageSrc: "/animations/images/image_61.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "buenos-aires",
      title: "BUENOS AIRES",
      location: "Argentina",
      imageSrc: "/animations/images/image_62.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "atacama",
      title: "ATACAMA DESERT",
      location: "Chile",
      imageSrc: "/animations/images/image_63.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "uyuni",
      title: "UYUNI SALT FLATS",
      location: "Bolivia",
      imageSrc: "/animations/images/image_64.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "cartagena",
      title: "CARTAGENA",
      location: "Colombia",
      imageSrc: "/animations/images/image_65.webp",
      width: 1600,
      height: 1067,
    },
  ],
  asia: [
    {
      id: "tokyo",
      title: "TOKYO",
      location: "Japan",
      imageSrc: "/animations/images/image_70.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "kyoto",
      title: "KYOTO",
      location: "Japan",
      imageSrc: "/animations/images/image_71.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "bali",
      title: "BALI",
      location: "Indonesia",
      imageSrc: "/animations/images/image_72.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "singapore",
      title: "SINGAPORE",
      location: "Singapore",
      imageSrc: "/animations/images/image_73.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "hanoi",
      title: "HANOI",
      location: "Vietnam",
      imageSrc: "/animations/images/image_74.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "seoul",
      title: "SEOUL",
      location: "South Korea",
      imageSrc: "/animations/images/image_75.webp",
      width: 1600,
      height: 1067,
    },
  ],
  europe: [
    {
      id: "paris",
      title: "PARIS",
      location: "France",
      imageSrc: "/animations/images/image_80.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "rome",
      title: "ROME",
      location: "Italy",
      imageSrc: "/animations/images/image_81.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "london",
      title: "LONDON",
      location: "United Kingdom",
      imageSrc: "/animations/images/image_82.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "barcelona",
      title: "BARCELONA",
      location: "Spain",
      imageSrc: "/animations/images/image_83.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "prague",
      title: "PRAGUE",
      location: "Czechia",
      imageSrc: "/animations/images/image_84.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "santorini",
      title: "SANTORINI",
      location: "Greece",
      imageSrc: "/animations/images/image_85.webp",
      width: 1600,
      height: 1067,
    },
  ],
  africa: [
    {
      id: "marrakech",
      title: "MARRAKECH",
      location: "Morocco",
      imageSrc: "/animations/images/image_86.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "capetown",
      title: "CAPE TOWN",
      location: "South Africa",
      imageSrc: "/animations/images/image_87.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "sahara",
      title: "SAHARA",
      location: "North Africa",
      imageSrc: "/animations/images/image_88.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "kilimanjaro",
      title: "KILIMANJARO",
      location: "Tanzania",
      imageSrc: "/animations/images/image_89.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "nairobi",
      title: "NAIROBI",
      location: "Kenya",
      imageSrc: "/animations/images/image_91.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "luxor",
      title: "LUXOR",
      location: "Egypt",
      imageSrc: "/animations/images/image_92.webp",
      width: 1600,
      height: 1067,
    },
  ],
  oceania: [
    {
      id: "sydney",
      title: "SYDNEY",
      location: "Australia",
      imageSrc: "/animations/images/image_93.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "melbourne",
      title: "MELBOURNE",
      location: "Australia",
      imageSrc: "/animations/images/image_94.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "auckland",
      title: "AUCKLAND",
      location: "New Zealand",
      imageSrc: "/animations/images/image_95.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "queenstown",
      title: "QUEENSTOWN",
      location: "New Zealand",
      imageSrc: "/animations/images/image_96.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "fiji",
      title: "FIJI",
      location: "Fiji",
      imageSrc: "/animations/images/image_97.webp",
      width: 1600,
      height: 1067,
    },
    {
      id: "tahiti",
      title: "TAHITI",
      location: "French Polynesia",
      imageSrc: "/animations/images/image_98.webp",
      width: 1600,
      height: 1067,
    },
  ],
};

export function ContinentExplorer() {
  const [active, setActive] = useState<ContinentId>("north-america");
  const headingId = useId();
  const tabPanelId = useId();

  const destinations = useMemo(() => MOCK_DATA[active], [active]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const idx = CONTINENTS.findIndex((c) => c.id === active);
    if (idx < 0) return;
    const nextIdx =
      event.key === "ArrowRight"
        ? (idx + 1) % CONTINENTS.length
        : (idx - 1 + CONTINENTS.length) % CONTINENTS.length;
    setActive(CONTINENTS[nextIdx].id);
  }

  return (
    <section className="bg-[#f5f5f5] text-[#0a0a0a]">
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Continents"
        className="mx-auto flex w-full max-w-[1400px] gap-2 overflow-x-auto px-4 pt-4 md:px-6"
        onKeyDown={onKeyDown}
      >
        {CONTINENTS.map((c) => {
          const isActive = c.id === active;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tabPanelId}-${c.id}`}
              className={`whitespace-nowrap rounded-sm px-6 py-3 text-sm font-bold tracking-wide transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "bg-black/75 text-white/90 hover:bg-black"
              }`}
              onClick={() => setActive(c.id)}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Heading */}
      <div className="mx-auto w-full max-w-[1400px] px-6 py-8 md:py-10">
        <h3
          id={headingId}
          className="m-0 mb-6 text-[clamp(2rem,6vw,3.2rem)] font-black leading-[1.1]"
        >
          Discover the <span className="italic">Wonders</span>
          <br />
          of {CONTINENTS.find((c) => c.id === active)?.label}
        </h3>

        {/* Grid */}
        <div
          role="tabpanel"
          id={`${tabPanelId}-${active}`}
          aria-labelledby={headingId}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {destinations.map((d) => (
            <article key={d.id} className="relative">
              <div className="relative aspect-[4/3] bg-black">
                <Image
                  src={d.imageSrc}
                  alt={d.location}
                  width={d.width}
                  height={d.height}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-3 top-3 text-[12px] font-extrabold tracking-[0.06em] text-white md:left-4 md:top-4 md:text-[14px]">
                  {d.title}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-[12px] font-bold tracking-[0.02em] text-white md:bottom-4 md:left-4 md:right-4 md:text-[14px]">
                  {d.location}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

