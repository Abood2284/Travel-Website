// components/trip-builder/TripBuilderSection.tsx
"use client";
import React, { useMemo, useState } from "react";
import GlobeOrthographicLoader from "@/components/destination-matrix/GlobeOrthographicLoader";
import { DESTINATIONS } from "@/lib/const";
import TripBuilderReceipt from "@/components/trip-builder/TripBuilderReceipt";
import type { Destination } from "@/components/destination-matrix/globe-orthographic";
import type { TripSeed } from "@/lib/trip-builder/types";

export default function TripBuilderSection() {
  const [seed, setSeed] = useState<TripSeed>({});
  const [originLabel, setOriginLabel] = useState<string>("Your City");

  const handlePickDestination = (dest: Destination | null) => {
    if (!dest) return;
    // Auto-seed the chat with the human-readable name
    setSeed({ destination: dest.name });
  };

  const handleUserPos = (pos: { lat: number; lon: number; label?: string }) => {
    // Keep this neutral unless you resolve to a city elsewhere
    setOriginLabel(pos.label || "Your Location");
  };

  return (
    <section>
      <GlobeOrthographicLoader
        destinations={DESTINATIONS}
        // Bubble events up
        onPickDestination={handlePickDestination}
        onUserPositionChange={handleUserPos}
      />

      <div style={{ padding: 20 }}>
        <TripBuilderReceipt
          seed={seed}
          originLabel={originLabel}
          title="Trip Builder Lite"
          subtitle="Pick quick answers. We’ll build your itinerary and a boarding pass preview."
        />
      </div>
    </section>
  );
}
