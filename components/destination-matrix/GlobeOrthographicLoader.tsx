// components/destination-matrix/GlobeOrthographicLoader.tsx
"use client";

import React, { useEffect, useState } from "react";
import GlobeOrthographic, {
  type Destination,
} from "@/components/destination-matrix/globe-orthographic";

// Minimal loader that fetches TopoJSON from /public and passes it to the globe.
// Keeps SSR clean and respects our GuardRails (lazy work happens inside the globe).

export default function GlobeOrthographicLoader({
  destinations,
  heightVh = 72,
  className,
  onPickDestination,
  onUserPositionChange,
}: {
  destinations: Destination[];
  heightVh?: number;
  className?: string;
  onPickDestination?: (dest: Destination | null) => void;
  onUserPositionChange?: (pos: {
    lat: number;
    lon: number;
    label?: string;
  }) => void;
}) {
  interface TopologyLike {
    objects: Record<string, unknown>;
  }
  const [topo, setTopo] = useState<TopologyLike | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [computedHeightVh, setComputedHeightVh] = useState<number>(heightVh);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1);
  const [maxHeightPx, setMaxHeightPx] = useState<number>(780);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Plain derived value; not a hook
  const selectedDestination = selectedId
    ? destinations.find((d) => d.id === selectedId) || null
    : null;

  // Wrap selection change to also notify parent
  const handleSelectionChange = (id: string | null) => {
    setSelectedId(id);
    const dest = id ? destinations.find((d) => d.id === id) || null : null;
    onPickDestination?.(dest);
  };

  // Dynamic viewport sizing for mobile using VisualViewport and CSS var --vvh
  useEffect(() => {
    const docEl =
      typeof document !== "undefined" ? document.documentElement : null;
    const vv =
      (typeof window !== "undefined" && (window as any).visualViewport) || null;

    const compute = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 0;
      const vhPx =
        vv?.height ||
        (typeof window !== "undefined" ? window.innerHeight : 800);
      const mobile = w < 640; // Tailwind sm breakpoint for mobile-first
      setIsMobile(mobile);

      // Set CSS var so 1vvh accounts for browser UI on mobile (url bar)
      if (docEl) docEl.style.setProperty("--vvh", `${vhPx / 100}px`);

      // Reserve space for titles/pills on mobile; less reserve on desktop
      const reservedPx = mobile ? 120 : 180; // header + margins around
      const availablePx = Math.max(280, vhPx - reservedPx);
      const targetVh = Math.max(14, Math.min(72, (availablePx / vhPx) * 100));

      // Scale globe more on mobile to fill visually without lag (lower maxHeight)
      setComputedHeightVh(targetVh);
      setScaleMultiplier(mobile ? 2 : 1);
      setMaxHeightPx(mobile ? Math.min(520, availablePx) : 820);
    };

    compute();
    window.addEventListener("resize", compute, { passive: true } as any);
    vv?.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("resize", compute as any);
      vv?.removeEventListener("resize", compute);
    };
  }, [heightVh]);
  useEffect(() => {
    let on = true;
    fetch("/data/world-110m.topo.json")
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
      )
      .then((json: TopologyLike) => {
        if (!on) return;
        // Optional: auto-pick polygon layer if name differs
        const objects = (json && json.objects) || {};
        type GeometryCollectionLike = {
          type?: string;
          geometries?: Array<{ type?: string }>;
        };
        const key = Object.keys(objects).find((k) => {
          const obj = (objects as Record<string, unknown>)[k] as
            | GeometryCollectionLike
            | undefined;
          return (
            obj &&
            obj.type === "GeometryCollection" &&
            (obj.geometries?.[0]?.type || "").includes("Polygon")
          );
        });
        if (!key) throw new Error("No polygon GeometryCollection found");
        // Normalize to .objects.countries for the child component's default
        if (key !== "countries") {
          (json as unknown as any).objects = {
            countries: (json as unknown as any).objects[key],
          };
        }
        setTopo(json);
      })
      .catch((e) => on && setErr(String(e)));
    return () => {
      on = false;
    };
  }, []);

  if (err) {
    return (
      <div className="w-full h-[50vh] grid place-items-center rounded-xl border border-white/10">
        <p className="text-sm text-red-400">Failed to load world map: {err}</p>
      </div>
    );
  }

  if (!topo) {
    return (
      <div
        className="w-full h-[50vh] animate-pulse rounded-xl bg-white/5 dark:bg-white/5"
        aria-label="Loading world map"
      />
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-0 md:mb-6">
          <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Choose Your Destination
          </h2>
          <p className="md:text-xl text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection of breathtaking destinations around
            the world. Click on any location to discover what makes it special.
          </p>
        </div>
      </div>

      <GlobeOrthographic
        destinations={destinations}
        worldTopo={topo}
        objectName="countries"
        heightVh={computedHeightVh}
        scaleMultiplier={scaleMultiplier}
        maxHeightPx={maxHeightPx}
        className={className}
        selectedId={selectedId}
        onSelectionChange={handleSelectionChange}
        planeSpeed={60} // ← slower (try 80–140)
      />

      {/* Location Pills */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div
          className="flex flex-nowrap md:flex-wrap gap-2.5 justify-start md:justify-center overflow-x-auto md:overflow-visible -mx-4 px-4"
          aria-label="Destination pills list"
        >
          {destinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => {
                const newSelection =
                  selectedId === destination.id ? null : destination.id;
                handleSelectionChange(newSelection); // ← was setSelectedId(newSelection)
              }}
              className={`
                px-3 py-2 md:px-3.5 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-200 whitespace-nowrap
                border border-gray-200 bg-white hover:border-sky-500 hover:shadow-sm
                ${
                  selectedId === destination.id
                    ? "border-sky-500 bg-sky-50 text-sky-700 shadow-[0_0_0_3px_rgba(14,165,233,0.15)]"
                    : "text-gray-700 hover:text-sky-600"
                }
              `}
            >
              {destination.name}, {destination.country}
            </button>
          ))}
        </div>

        {/* Selection feedback */}
        {selectedDestination && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Selected:{" "}
              <span className="font-medium text-sky-600">
                {selectedDestination.name}, {selectedDestination.country}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Click again to deselect
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
