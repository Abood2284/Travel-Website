"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface DestinationHeroProps {
  name: string;
  country: string;
  description: string;
  // Pass the full path from public, e.g. 
  // "/destinations/dubai.jpg" or "/destinations/your-image.png"
  heroImage: string;
}

export default function DestinationHero({
  name,
  country,
  description,
  heroImage,
}: DestinationHeroProps) {
  // Normalize common path shapes so local images under /public/destinations are used.
  const resolveLocalPath = (p: string) => {
  if (!p) return "/destinations/dubai.jpg";
    // If dataset uses /images/destinations/... convert to /destinations/...
    if (p.startsWith("/images/destinations/")) {
      // try to map '/images/destinations/dubai-hero.jpg' -> '/destinations/dubai.jpg'
      const name = p.split("/").pop() || "default.jpg";
      // Prefer a simpler basename without '-hero' suffix if present
      const simplified = name.replace(/-hero/i, "");
      return `/destinations/${simplified}`;
    }
    // If already under /destinations or any other public path, use as-is
    return p;
  };

  const [imageSrc, setImageSrc] = useState(resolveLocalPath(heroImage || ""));

  return (
    <section className="relative h-[65vh] min-h-[520px] flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          onError={() => {
            // fallback to dubai image if remote or file path fails
            if (imageSrc !== "/destinations/dubai.jpg") setImageSrc("/destinations/dubai.jpg");
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-[0.75rem] uppercase tracking-[0.4em] text-white/80 mb-4 block">
            Explore {country}
          </span>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black text-white mb-6 tracking-tight leading-tight">
            {name}
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>
      </div>

      {/* Bottom fade to white background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
}
