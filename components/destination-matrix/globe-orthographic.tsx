// components/destination-matrix/globe-orthographic.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import { motion, animate } from "motion/react";
import { AirplaneQatar3D } from "@/components/icons/AirplaneQatar3D"; // ← adjust path if needed
import { useSound } from "@/sfx/SoundProvider";

// ---- Shared types ----
export type Destination = {
  id: string;
  name: string;
  country: string;
  coords: { lat: number; lon: number };
};

const VIEW_W = 800; // internal viewBox width
const VIEW_H = 400; // internal viewBox height

const COLORS = {
  bg: "#EBEBEB",
  water: "#0B0B0B",
  land: "#161616",
  landStroke: "#3A3A3A", // country borders (lighter than sphereStroke)
  sphereStroke: "#0A0A0A", // outer sphere/continent outline (darker)
  landGlow: "#EBEBEB",
  landGlowGold: "#F5C542",
  graticule: "#2E2E2E",
  pinUser: "#FFFFFF",
  pinUserGlow: "rgba(255, 255, 255, 0.22)",
  pinDest: "#A1A1A1",
  pinDestGlow: "rgba(200, 200, 200, 0.18)",
  route: "#FFFFFF",
  routeStroke: "#FFFFFF",
};

const DEFAULT_USER_POS = {
  lat: 19.076,
  lon: 72.8777,
  label: "Mumbai (fallback)",
};

// --- location prompt state & helpers
const isSecureContext =
  typeof window !== "undefined" ? window.isSecureContext : true;

function toNum(v: string, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

// --- coords safety: keep lats within [-90,90], lons within [-180,180]
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const normalizeLon = (lon: number) => {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
};
const normCoords = (lat: number, lon: number) => ({
  lat: clamp(lat, -90, 90),
  lon: normalizeLon(lon),
});

// Great-circle utility (slerp) returning GeoJSON LineString
function greatCircleLine(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  steps = 96
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const latLonToVec = (lat: number, lon: number) => {
    const φ = toRad(lat),
      λ = toRad(lon);
    return {
      x: Math.cos(φ) * Math.cos(λ),
      y: Math.cos(φ) * Math.sin(λ),
      z: Math.sin(φ),
    };
  };
  const normalize = (v: any) => {
    const m = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / m, y: v.y / m, z: v.z / m };
  };
  const vecToLatLon = (v: any) => {
    const φ = Math.asin(Math.max(-1, Math.min(1, v.z)));
    const λ = Math.atan2(v.y, v.x);
    return { lat: toDeg(φ), lon: toDeg(λ) };
  };
  const A = latLonToVec(a.lat, a.lon);
  const B = latLonToVec(b.lat, b.lon);
  const dot = Math.max(-1, Math.min(1, A.x * B.x + A.y * B.y + A.z * B.z));
  const theta = Math.acos(dot);
  if (theta < 1e-6)
    return {
      type: "LineString",
      coordinates: [
        [a.lon, a.lat],
        [b.lon, b.lat],
      ],
    } as const;
  const sinTheta = Math.sin(theta);
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s1 = Math.sin((1 - t) * theta) / sinTheta;
    const s2 = Math.sin(t * theta) / sinTheta;
    const x = s1 * A.x + s2 * B.x;
    const y = s1 * A.y + s2 * B.y;
    const z = s1 * A.z + s2 * B.z;
    const ll = vecToLatLon(normalize({ x, y, z }));
    coords.push([ll.lon, ll.lat]);
  }
  return { type: "LineString", coordinates: coords } as const;
}

// Simple pin component matching HTML style with bouncy hover effect
function Pin({
  x,
  y,
  r = 5,
  color,
  glow,
  isSelected = false,
  isUser = false,
  onClick,
  tooltip,
}: {
  x: number;
  y: number;
  r?: number;
  color: string;
  glow: string;
  isSelected?: boolean;
  isUser?: boolean;
  onClick?: () => void;
  tooltip?: string; // "Name, Country" or just "Name"
}) {
  // Split into 2 neat rows if a comma is present
  const [line1Raw, line2Raw] = (tooltip || "").split(",").map((s) => s?.trim());
  const line1 = line1Raw || "";
  const line2 = line2Raw || "";

  // Tooltip sizing (lightweight estimate; no canvas measurement -> fast)
  const fontSize = 11;
  const padX = 8,
    padY = 6,
    gapY = line2 ? 3 : 0;
  const est = (s: string) => Math.ceil(s.length * 6.2); // ~avg glyph width at 11px
  const textW = Math.max(est(line1), est(line2));
  const boxW = clamp(textW + padX * 2, 90, 200);
  const boxH = padY * 2 + fontSize + (line2 ? gapY + fontSize : 0);

  // Position: default above-right; flip if near edges
  let boxX = x + 12;
  let boxY = y - (boxH + 12);
  if (boxX + boxW > VIEW_W - 6) boxX = x - (boxW + 12); // flip left
  if (boxY < 6) boxY = y + 12; // flip below

  const radius = isUser ? r + 0.5 : r;
  return (
    <g
      data-pin
      className="group cursor-pointer transition-transform duration-[180ms] ease-out hover:scale-[1.08] pointer-events-auto"
      style={{ transformOrigin: `${x}px ${y}px` }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={tooltip}
    >
      {/* Soft glow */}
      <circle
        cx={x}
        cy={y}
        r={radius + 8}
        fill={glow}
        opacity={0.15}
        className="pointer-events-none"
      />
      {/* Selection pulse */}
      {isSelected && (
        <>
          <circle
            cx={x}
            cy={y}
            r={radius + 12}
            fill={COLORS.pinUser}
            opacity={0.1}
            className="animate-pulse pointer-events-none"
          />
          <circle
            cx={x}
            cy={y}
            r={radius + 8}
            fill={COLORS.pinUser}
            opacity={0.2}
            className="animate-pulse pointer-events-none"
            style={{ animationDelay: "0.3s" }}
          />
          <circle
            cx={x}
            cy={y}
            r={radius + 4}
            fill={COLORS.pinUser}
            opacity={0.3}
            className="animate-pulse pointer-events-none"
            style={{ animationDelay: "0.6s" }}
          />
        </>
      )}

      {/* Dot */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        className="hover:opacity-80 transition-opacity duration-150"
      />

      {/* Hover tooltip */}
      {tooltip && (
        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          <rect
            x={boxX}
            y={boxY}
            width={boxW}
            height={boxH}
            rx={8}
            ry={8}
            fill="rgba(10,16,28,0.88)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={0.5}
          />
          {/* First row */}
          <text
            x={boxX + padX}
            y={boxY + padY + fontSize - 2}
            fontSize={fontSize}
            fill="white"
            fontWeight={600}
          >
            {line1}
          </text>
          {/* Second row (optional) */}
          {line2 && (
            <text
              x={boxX + padX}
              y={boxY + padY + fontSize + gapY + fontSize - 2}
              fontSize={fontSize - 1}
              fill="rgba(255,255,255,0.85)"
            >
              {line2}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

// --- Main component ---
export default function GlobeOrthographic({
  destinations,
  worldTopo, // TopoJSON (e.g., Natural Earth 110m)
  objectName = "countries",
  heightVh = 72,
  className,
  selectedId,
  onSelectionChange,
  planeSpeed = 100, // px per second (lower = slower)
  onPickDestination,
  onUserPositionChange,
  scaleMultiplier = 1,
  maxHeightPx = 780,
  // sound controls
  planeSoundStartSec = 2.2,
  planeSoundDurationSec = 3,
  planeSoundVolume = 0.1,
}: {
  destinations: Destination[];
  worldTopo: any; // topojson.Topology
  objectName?: string; // name of the object inside topology (e.g., "countries")
  heightVh?: number;
  className?: string;
  selectedId?: string | null;
  onSelectionChange?: (idd: string | null) => void;
  planeSpeed?: number;
  onPickDestination?: (dest: Destination | null) => void;
  onUserPositionChange?: (pos: {
    lat: number;
    lon: number;
    label?: string;
  }) => void;
  scaleMultiplier?: number;
  maxHeightPx?: number;
  planeSoundStartSec?: number;
  planeSoundDurationSec?: number;
  planeSoundVolume?: number;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const { playSample, stopSample, enabled: soundEnabled } = useSound();
  const playingRef = useRef(false);

  // geo state
  const [rotation, setRotation] = useState<[number, number, number]>([
    0, -10, 0,
  ]); // [λ, φ, γ]
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; rot: [number, number, number] } | null>(
    null
  );
  const [showLocPrompt, setShowLocPrompt] = useState(false);
  const [locRequesting, setLocRequesting] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<
    "fallback" | "geolocation" | "manual"
  >("fallback");
  const [revGeoLabel, setRevGeoLabel] = useState<string | null>(null);
  const [revGeoStatus, setRevGeoStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Manual entry UI
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState<string>("");
  const [manualLon, setManualLon] = useState<string>("");

  const planeSize = 28; // tweak as needed
  const planeTRef = useRef(0); // 0..1 progress along path
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  // Interaction + input throttling
  const [isInteracting, setIsInteracting] = useState(false);
  const interactIdleRef = useRef<number | null>(null);
  const rafMovePending = useRef(false);
  const lastPointerX = useRef<number | null>(null);
  const rafWheelPending = useRef(false);
  const lastWheelDeltaX = useRef<number>(0);
  const uidRef = useRef<string>("");
  if (!uidRef.current) uidRef.current = Math.random().toString(36).slice(2);

  // Simple seeded PRNG for stable randomness across renders
  function mulberry32(seed: number) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Rotation animation state
  const rotationAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const rotationRef = useRef<[number, number, number]>([0, -10, 0]);
  // Track if we've already completed one flight on mobile to avoid re-drawing effects
  const hasFlownRef = useRef(false);
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  function normalizeDeg(x: number) {
    let a = x;
    while (a > 180) a -= 360;
    while (a < -180) a += 360;
    return a;
  }

  function shortestDelta(a: number, b: number) {
    const diff = normalizeDeg(b - a);
    return diff;
  }

  const rotateTo = React.useCallback(
    (lat: number, lon: number, durationMs = 900) => {
      const target = [normalizeDeg(-lon), normalizeDeg(-lat), 0] as [
        number,
        number,
        number
      ];
      const start = rotationRef.current;
      const dλ = shortestDelta(start[0], target[0]);
      const dφ = shortestDelta(start[1], target[1]);
      rotationAnimRef.current?.stop();
      rotationAnimRef.current = animate(0, 1, {
        duration: Math.max(0.2, durationMs / 1000),
        ease: "easeInOut",
        onUpdate: (t) => {
          const λ = normalizeDeg(start[0] + dλ * t);
          const φ = normalizeDeg(start[1] + dφ * t);
          setRotation([λ, φ, 0]);
        },
        onComplete: () => {},
      });
    },
    []
  );

  // Recompute plane x/y/heading for current SVG path & a normalized progress t
  function updatePlaneAtProgress(t: number) {
    const el = routePathRef.current;
    if (!el) return;
    let total = 0;
    try {
      total = el.getTotalLength();
    } catch {
      total = 0;
    }
    if (!total) return;
    const len = Math.max(0, Math.min(1, t)) * total;
    const p = el.getPointAtLength(len);
    const p0 = el.getPointAtLength(Math.max(0, len - 1));
    const angle = (Math.atan2(p.y - p0.y, p.x - p0.x) * 180) / Math.PI;
    setPlane({ x: p.x, y: p.y, angle });
  }

  useEffect(() => {
    if (active) setShowLocPrompt(true);
  }, [active]);

  function requestBrowserLocation() {
    setLocError(null);
    if (!("geolocation" in navigator)) {
      setLocError("Geolocation is not available in this browser.");
      return;
    }
    if (!isSecureContext) {
      setLocError("Geolocation needs HTTPS (secure context).");
      return;
    }
    setLocRequesting(true);
    const onSuccess = (pos: GeolocationPosition) => {
      setUserPos({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        label: "Geolocation",
      });
      setLocationSource("geolocation");
      setLocRequesting(false);
      setShowLocPrompt(false);
    };
    const onError = (err: GeolocationPositionError | any) => {
      // One retry with stricter options if first attempt timed out
      if (err && (err.code === 3 || err.name === "TimeoutError")) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (e) => {
            setLocRequesting(false);
            setLocError(e?.message || "Failed to get your location.");
          },
          { enableHighAccuracy: false, maximumAge: 0, timeout: 30000 }
        );
        return;
      }
      setLocRequesting(false);
      setLocError(err?.message || "Failed to get your location.");
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      maximumAge: 60_000,
      timeout: 20000,
    });
  }

  function applyManualLocation() {
    const c = normCoords(toNum(manualLat), toNum(manualLon));
    setUserPos({ lat: c.lat, lon: c.lon, label: "Custom" });
    setLocationSource("manual");
    setShowLocPrompt(false);
  }

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Heuristic: detect low-end devices and lower quality aggressively
  const isLowEndDevice = useMemo(() => {
    if (typeof window === "undefined") return false;
    const dm = (navigator as any).deviceMemory as number | undefined;
    const dpr = window.devicePixelRatio || 1;
    const hwLow = dm !== undefined ? dm <= 4 : false;
    const highDprOnMobile = dpr > 2 && window.innerWidth < 900;
    return hwLow || highDprOnMobile || prefersReducedMotion;
  }, [prefersReducedMotion]);

  // Lazy-activate
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(true)),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Geolocation - start with fallback position
  const [userPos, setUserPos] = useState<{
    lat: number;
    lon: number;
    label?: string;
  }>(DEFAULT_USER_POS);

  // Build features & graticule
  const { countries, graticule } = useMemo(() => {
    const fc = feature(
      worldTopo,
      worldTopo.objects[objectName]
    ) as unknown as FeatureCollection<Geometry>;
    const grat = d3.geoGraticule10();
    return { countries: fc, graticule: grat };
  }, [worldTopo, objectName]);

  // Selected destination + route (moved up so projection can react to selection)
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null
  );
  const currentSelectedId =
    selectedId !== undefined ? selectedId : internalSelectedId;
  const selected = useMemo(
    () => destinations.find((d) => d.id === currentSelectedId) || null,
    [destinations, currentSelectedId]
  );

  // Disable mobile zooming: keep zoom fixed at 1 for performance
  const [selectionZoomAnimated, setSelectionZoomAnimated] = useState<number>(1);
  const zoomAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  useEffect(() => {
    zoomAnimRef.current?.stop?.();
    if (selectionZoomAnimated !== 1) setSelectionZoomAnimated(1);
    return () => zoomAnimRef.current?.stop?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // Projection
  const projection = useMemo(() => {
    const base = d3
      .geoOrthographic()
      .translate([VIEW_W / 2, VIEW_H / 2])
      .clipAngle(90)
      .rotate(rotation);
    const baseScale = isLowEndDevice
      ? Math.min(VIEW_W, VIEW_H) * 0.45
      : Math.min(VIEW_W, VIEW_H) * 0.48;
    // Keep projection scale stable; visual zoom is applied via a wrapping <g>
    const scaled = baseScale * Math.max(0.5, scaleMultiplier);
    return base.scale(scaled);
  }, [rotation, isLowEndDevice, scaleMultiplier]);
  const path = useMemo(() => d3.geoPath(projection), [projection]);

  // Single combined land path for lower DOM/filter cost
  const landCombinedPath = useMemo(() => {
    const feats = (countries.features || []) as any[];
    if (!feats.length) return null;
    // Render all features through one path generator call via FeatureCollection
    const fc = {
      type: "FeatureCollection",
      features: feats,
    } as FeatureCollection;
    return path(fc as unknown as GeoPermissibleObjects) || null;
  }, [countries, path]);

  // (removed unused countryGlowTimings)

  // (removed unused population dots)

  // Memoize pin positions to prevent unnecessary re-renders
  const isFrontSideMemo = React.useCallback(isFrontSide, [rotation]);
  const pinPositions = useMemo(() => {
    const positions = new Map();

    // User pin position
    if (isFrontSideMemo(userPos.lat, userPos.lon)) {
      const p = projection([
        normalizeLon(userPos.lon),
        clamp(userPos.lat, -90, 90),
      ]);
      if (p) positions.set("user", { x: p[0], y: p[1] });
    }

    // Destination pin positions
    destinations.forEach((d) => {
      const c = normCoords(d.coords.lat, d.coords.lon);
      if (isFrontSideMemo(c.lat, c.lon)) {
        const p = projection([c.lon, c.lat]);
        if (p) positions.set(d.id, { x: p[0], y: p[1] });
      }
    });

    return positions;
  }, [projection, userPos, destinations, isFrontSideMemo]);

  // Reverse geocode user's location into City, Country using BigDataCloud (no key required)
  useEffect(() => {
    if (
      userPos.lat === undefined ||
      userPos.lon === undefined ||
      !Number.isFinite(userPos.lat) ||
      !Number.isFinite(userPos.lon)
    ) {
      setRevGeoLabel(null);
      setRevGeoStatus("idle");
      return;
    }
    let cancelled = false;
    setRevGeoStatus("loading");
    const lat = clamp(userPos.lat, -90, 90);
    const lon = normalizeLon(userPos.lon);
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
      lat
    )}&longitude=${encodeURIComponent(lon)}&localityLanguage=en`;
    fetch(url)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
      )
      .then((j) => {
        if (cancelled) return;
        const city = j.city || j.locality || j.principalSubdivision || "";
        const country = j.countryName || j.countryCode || "";
        const label = [city, country].filter(Boolean).join(", ");
        setRevGeoLabel(label || null);
        setRevGeoStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setRevGeoLabel(null);
        setRevGeoStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [userPos.lat, userPos.lon]);

  // Mobile-only: prefer reverse geocoded City, Country; fall back to provided label
  const sourcePlaceLabel = useMemo(() => {
    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 640 : false;
    if (!isMobile) return null;
    if (revGeoLabel && revGeoLabel.trim()) return revGeoLabel;
    if (
      userPos.label &&
      userPos.label !== "Geolocation" &&
      userPos.label !== "Custom"
    )
      return userPos.label;
    if (locationSource === "fallback") return `${DEFAULT_USER_POS.label}`;
    return "Your location";
  }, [revGeoLabel, userPos.label, locationSource]);

  // Tooltip label for the user pin: prefer nearest "City, Country" when reasonably close
  const sourceTooltipLabel = useMemo(() => {
    if (revGeoLabel && revGeoLabel.trim()) return revGeoLabel;
    if (
      userPos.label &&
      userPos.label !== "Geolocation" &&
      userPos.label !== "Custom"
    )
      return userPos.label;
    if (locationSource === "fallback") return `${DEFAULT_USER_POS.label}`;
    return "Your location";
  }, [revGeoLabel, userPos.label, locationSource]);

  // Helper: ignore gestures that originate from a clickable pin
  const eventFromPin = (e: any) => {
    const t = e?.target as Element | null;
    return !!t && !!t.closest?.("[data-pin]");
  };

  // Pointer + wheel handlers (horizontal scroll = yaw)
  const onPointerDown: React.PointerEventHandler<SVGSVGElement> = (e) => {
    if (eventFromPin(e)) return; // don't start globe drag when starting on a pin
    (e.currentTarget as any).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, rot: rotation };
  };
  const onPointerMove: React.PointerEventHandler<SVGSVGElement> = (e) => {
    if (!dragging || !dragStart.current || eventFromPin(e)) return;
    lastPointerX.current = e.clientX;
    if (rafMovePending.current) return;
    rafMovePending.current = true;
    requestAnimationFrame(() => {
      rafMovePending.current = false;
      if (!dragging || !dragStart.current) return;
      const x = lastPointerX.current ?? dragStart.current.x;
      const dx = x - dragStart.current.x;
      const degPerPx = 360 / VIEW_W;
      const λ = dragStart.current.rot[0] + dx * degPerPx;
      setRotation([λ, dragStart.current.rot[1], 0]);
      // mark interacting and schedule idle reset
      if (!isInteracting) setIsInteracting(true);
      if (interactIdleRef.current) clearTimeout(interactIdleRef.current);
      interactIdleRef.current = window.setTimeout(
        () => setIsInteracting(false),
        140
      );
    });
  };
  const onPointerUp: React.PointerEventHandler<SVGSVGElement> = (e) => {
    if (eventFromPin(e)) return; // pin click should not toggle drag state here
    (e.currentTarget as any).releasePointerCapture(e.pointerId);
    setDragging(false);
    dragStart.current = null;
  };
  const onWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    if (eventFromPin(e)) return; // scroll over a pin shouldn't rotate the globe
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return; // only react to horizontal
    e.preventDefault();
    lastWheelDeltaX.current += e.deltaX;
    if (rafWheelPending.current) return;
    rafWheelPending.current = true;
    requestAnimationFrame(() => {
      rafWheelPending.current = false;
      const delta = lastWheelDeltaX.current;
      lastWheelDeltaX.current = 0;
      const λ = rotation[0] + delta * 0.25; // slower scale for wheels/trackpads
      setRotation([λ, rotation[1], rotation[2]]);
      if (!isInteracting) setIsInteracting(true);
      if (interactIdleRef.current) clearTimeout(interactIdleRef.current);
      interactIdleRef.current = window.setTimeout(
        () => setIsInteracting(false),
        140
      );
    });
  };

  // Visibility test (front side only) for pins
  function isFrontSide(lat: number, lon: number) {
    const center = [-rotation[0], -rotation[1]] as [number, number];
    const dist = d3.geoDistance([lon, lat], center);
    return dist <= Math.PI / 2; // within 90° of center
  }

  // Selected destination + route

  useEffect(() => {
    onPickDestination?.(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  useEffect(() => {
    onUserPositionChange?.(userPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPos.lat, userPos.lon, userPos.label]);

  // Mobile-only: bring user's location into view when set, if no destination selected
  useEffect(() => {
    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 640 : false;
    if (!isMobile) return;
    if (selected) return;
    rotateTo(userPos.lat, userPos.lon, 600);
  }, [userPos.lat, userPos.lon, selected, rotateTo]);

  const handleSelectionChange = (id: string | null) => {
    // Toggle selection: if clicking the same destination, deselect it
    const newSelection = currentSelectedId === id ? null : id;

    if (onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      setInternalSelectedId(newSelection);
    }
  };

  const routeLine = useMemo(() => {
    if (!selected) return null;
    const A = normCoords(userPos.lat, userPos.lon);
    const B = normCoords(selected.coords.lat, selected.coords.lon);
    return greatCircleLine(A, B, prefersReducedMotion ? 24 : 96);
  }, [userPos, selected, prefersReducedMotion]);

  // --- Plane following the route ---
  const routePathRef = useRef<SVGPathElement | null>(null);
  const [plane, setPlane] = useState<{
    x: number;
    y: number;
    angle: number;
  } | null>(null);

  const routeD = useMemo(
    () =>
      routeLine
        ? path(routeLine as unknown as GeoPermissibleObjects) || ""
        : "",
    [routeLine, path]
  );

  // When the projection (routeD) changes as you rotate/drag,
  // simply reproject the current progress — no restart.
  useEffect(() => {
    if (!selected) return;
    updatePlaneAtProgress(planeTRef.current);
  }, [routeD, selected]);

  useEffect(() => {
    if (!selected || !routeD) {
      // No route: clear plane and stop any running animation
      animRef.current?.stop?.();
      setPlane(null);
      if (playingRef.current) {
        stopSample("jet", { fadeMs: 150 });
        playingRef.current = false;
      }
      return;
    }

    // Starting a new route animation only when selection (route) actually changes
    animRef.current?.stop?.();

    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 640 : false;
    const dest = selected.coords;

    const startPlaneAnimation = () => {
      const el = routePathRef.current;
      if (!el) return;
      let total = 0;
      try {
        total = el.getTotalLength();
      } catch {
        total = 0;
      }
      if (!total) {
        setPlane(null);
        return;
      }
      planeTRef.current = 0;
      updatePlaneAtProgress(0);
      const duration = Math.min(6, Math.max(0.6, total / planeSpeed));
      const coords = (routeLine?.coordinates || []) as [number, number][];
      // sound: start when the plane starts moving; respect reduced motion and toggle
      if (!prefersReducedMotion && soundEnabled) {
        playSample("jet", {
          start: planeSoundStartSec,
          duration: planeSoundDurationSec,
          volume: planeSoundVolume,
          fadeMs: 150,
        });
        playingRef.current = true;
      }
      animRef.current = animate(0, 1, {
        duration,
        ease: "linear",
        onUpdate: (t) => {
          planeTRef.current = t;
          updatePlaneAtProgress(t);
        },
        onComplete: () => {
          if (playingRef.current) {
            stopSample("jet", { fadeMs: 150 });
            playingRef.current = false;
          }
        },
      });
    };

    // Mobile now follows desktop behavior (no deep zoom / no camera-follow)

    // Desktop/default: rotate to destination, then fly (no camera follow)
    rotateTo(dest.lat, dest.lon);
    const id = requestAnimationFrame(() => {
      setTimeout(startPlaneAnimation, 900);
    });
    return () => cancelAnimationFrame(id);
  }, [
    selected,
    planeSpeed,
    prefersReducedMotion,
    soundEnabled,
    planeSoundStartSec,
    planeSoundDurationSec,
    planeSoundVolume,
    stopSample,
    playSample,
  ]);

  return (
    <section
      ref={sectionRef}
      className={className}
      style={{
        // Use VisualViewport-adjusted vvh on mobile-capable browsers; fallback to vh
        height: `calc(${heightVh} * (var(--vvh, 1vh)))`,
        maxHeight: maxHeightPx,
        minHeight: 360,
        position: "relative",
        overflow: "hidden",
        background: COLORS.bg,
      }}
      aria-label="Destination globe (orthographic)"
    >
      {(() => {
        // Compute zoom focal point in SVG coords so scale targets the subject
        const isMobileViewport =
          typeof window !== "undefined" ? window.innerWidth < 640 : false;
        const zoom = 1; // fixed zoom for both desktop and mobile
        let fx = VIEW_W / 2;
        let fy = VIEW_H / 2;
        if (isMobileViewport && zoom > 1) {
          if (plane) {
            fx = plane.x;
            fy = plane.y;
          } else if (selected) {
            const p = projection([
              normalizeLon(selected.coords.lon),
              clamp(selected.coords.lat, -90, 90),
            ]);
            if (p) {
              fx = p[0];
              fy = p[1];
            }
          } else {
            const p = projection([
              normalizeLon(userPos.lon),
              clamp(userPos.lat, -90, 90),
            ]);
            if (p) {
              fx = p[0];
              fy = p[1];
            }
          }
        }
        // expose as vars for the group below via inline JSX scope
        (window as any).__globe_fx = fx; // no-op but keeps lints calm if unused
        (window as any).__globe_fy = fy;
        (window as any).__globe_zoom = zoom;
        return null;
      })()}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full absolute inset-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        role="application"
        aria-roledescription="draggable globe"
      >
        {/* Mobile zoom wrapper so pins/plane/tooltips scale together, centered on target */}
        <g
          transform={`translate(${(window as any).__globe_fx ?? VIEW_W / 2} ${
            (window as any).__globe_fy ?? VIEW_H / 2
          }) scale(${(window as any).__globe_zoom ?? 1}) translate(-${
            (window as any).__globe_fx ?? VIEW_W / 2
          } -${(window as any).__globe_fy ?? VIEW_H / 2})`}
        >
          <defs>
            {/* Single, tuned blur filter for gold glow (replaces two-stage bloom) */}
            <filter id="landGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="1.2"
                result="blur"
              />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <style>
              {`@keyframes glowPulse { 0% { opacity: 0.25 } 50% { opacity: 0.75 } 100% { opacity: 0.25 } }`}
            </style>
            <clipPath id={`landClip-${uidRef.current}`}>
              {landCombinedPath && <path d={landCombinedPath} />}
            </clipPath>
            {/* Population dot patterns (two layers, offset/rotated) */}
            <pattern
              id={`popA-${uidRef.current}`}
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(7)"
            >
              <circle cx="6" cy="8" r="0.9" fill="#fff7cc" opacity="0.14" />
              <circle cx="18" cy="4" r="0.7" fill="#fff7cc" opacity="0.12" />
              <circle cx="12" cy="18" r="0.8" fill="#fff7cc" opacity="0.16" />
              <circle cx="2" cy="20" r="0.6" fill="#fff7cc" opacity="0.10" />
            </pattern>
            <pattern
              id={`popB-${uidRef.current}`}
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-11)"
            >
              <circle cx="4" cy="6" r="0.7" fill="#fff7cc" opacity="0.12" />
              <circle cx="14" cy="10" r="0.9" fill="#fff7cc" opacity="0.14" />
              <circle cx="20" cy="16" r="0.8" fill="#fff7cc" opacity="0.12" />
              <circle cx="10" cy="2" r="0.6" fill="#fff7cc" opacity="0.10" />
            </pattern>
          </defs>
          {/* Background (not water) */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill={COLORS.bg} />

          {/* Sphere outline */}
          <path
            d={path({ type: "Sphere" } as unknown as GeoPermissibleObjects)!}
            fill={COLORS.water}
            stroke={COLORS.sphereStroke}
            strokeWidth={1}
          />

          {/* Graticule (latitude/longitude lines) */}
          {(() => {
            const isMobileViewport =
              typeof window !== "undefined" ? window.innerWidth < 640 : false;
            if (!isMobileViewport && isLowEndDevice) return null;
            const strokeW = isMobileViewport ? 0.7 : 0.6;
            const opacity = isMobileViewport ? 0.6 : 0.35;
            return (
              <path
                d={path(graticule as unknown as GeoPermissibleObjects)!}
                fill="none"
                stroke={COLORS.graticule}
                strokeWidth={strokeW}
                opacity={opacity}
              />
            );
          })()}

          {/* Land with fixed feathered gold glow on borders (single combined path) */}
          {landCombinedPath && (
            <g>
              <path
                d={landCombinedPath}
                fill="none"
                stroke={COLORS.landGlowGold}
                strokeWidth={1.6}
                opacity={0.3}
                filter="url(#landGlow)"
              />
              <path
                d={landCombinedPath}
                fill="none"
                stroke={COLORS.landGlowGold}
                strokeWidth={1.0}
                opacity={0.5}
                filter="url(#landGlow)"
              />
              <path
                d={landCombinedPath}
                fill={COLORS.land}
                stroke={COLORS.landStroke}
                strokeWidth={0.6}
              />
            </g>
          )}

          {/* Population splatter dots clipped to land */}
          {/* Pattern-based population dots (fast, single rects) */}
          {!isLowEndDevice && (
            <g clipPath={`url(#landClip-${uidRef.current})`}>
              <rect
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
                fill={`url(#popA-${uidRef.current})`}
              />
              <rect
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
                fill={`url(#popB-${uidRef.current})`}
              />
            </g>
          )}

          {/* Route (clipped by projection automatically) */}
          {routeLine && (
            <>
              {(() => {
                const isMobileViewport =
                  typeof window !== "undefined"
                    ? window.innerWidth < 640
                    : false;
                // On mobile after the first flight, avoid re-drawing the dashed path to keep continuity
                if (isMobileViewport && hasFlownRef.current) {
                  return (
                    <path
                      d={routeD || undefined}
                      fill="none"
                      stroke={COLORS.route}
                      strokeWidth={2.25}
                      strokeLinecap="round"
                      strokeDasharray="6 6"
                    />
                  );
                }
                return (
                  <motion.path
                    key={selected?.id || "no-selection"}
                    d={routeD || undefined}
                    fill="none"
                    stroke={COLORS.route}
                    strokeWidth={2.25}
                    strokeLinecap="round"
                    strokeDasharray="6 6"
                    initial={{
                      opacity: 0,
                      strokeDashoffset: prefersReducedMotion ? 0 : 300,
                    }}
                    animate={{
                      opacity: 1,
                      strokeDashoffset: 0,
                    }}
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : { duration: 0.95, ease: "easeOut" }
                    }
                  />
                );
              })()}
              {/* Hidden measurement path for plane follow (no stroke/fill) */}
              <path
                ref={routePathRef}
                d={routeD || undefined}
                fill="none"
                stroke="none"
                pointerEvents="none"
              />
            </>
          )}

          {/* Plane following the route */}
          {plane && (
            <g
              pointerEvents="none"
              transform={`translate(${plane.x.toFixed(2)} ${plane.y.toFixed(
                2
              )}) rotate(${(plane.angle + 90).toFixed(2)}) translate(${
                -planeSize / 2
              } ${-planeSize / 2})`}
            >
              <AirplaneQatar3D size={planeSize} shadow burgundy="#5C0631" />
            </g>
          )}

          {/* Pins */}
          {/* User pin */}
          {pinPositions.has("user") &&
            (() => {
              const pos = pinPositions.get("user");
              return (
                <Pin
                  x={pos.x}
                  y={pos.y}
                  r={5.5}
                  color={COLORS.pinUser}
                  glow={COLORS.pinUserGlow}
                  isUser={true}
                  tooltip={sourceTooltipLabel}
                />
              );
            })()}

          {/* Destination pins */}
          {destinations.map((d) => {
            if (!pinPositions.has(d.id)) return null; // hide back-side pins
            const pos = pinPositions.get(d.id);
            const isSel = Boolean(selected && selected.id === d.id);
            return (
              <g key={d.id}>
                <Pin
                  x={pos.x}
                  y={pos.y}
                  r={5}
                  color={isSel ? COLORS.pinUser : COLORS.pinDest}
                  glow={isSel ? COLORS.pinUserGlow : COLORS.pinDestGlow}
                  isSelected={isSel}
                  onClick={() => handleSelectionChange(d.id)}
                  tooltip={`${d.name}, ${d.country}`}
                />
                {isSel
                  ? (() => {
                      const isMobileViewport =
                        typeof window !== "undefined"
                          ? window.innerWidth < 640
                          : false;
                      if (isMobileViewport) {
                        const city = String(d.name || "")
                          .trim()
                          .replace(/\s+/g, " ");
                        const country = String(d.country || "")
                          .trim()
                          .replace(/\s+/g, " ");
                        const est = (s: string) => Math.ceil(s.length * 6.6); // ~ width per char at 13px
                        const pad = 4;
                        const line1H = 13;
                        const line2H = 12;
                        const gap = 2;
                        const boxW =
                          Math.max(est(city), est(country)) + pad * 2;
                        const boxH = pad + line1H + gap + line2H + pad;
                        const px = Math.round(
                          Math.min(pos.x + 12, VIEW_W - 4 - boxW)
                        );
                        const py = Math.round(pos.y - (boxH - 6));
                        return (
                          <g transform={`translate(${px}, ${py})`}>
                            {/* shadow without filters */}
                            <rect
                              x={0}
                              y={1}
                              width={boxW}
                              height={boxH}
                              rx={10}
                              ry={10}
                              fill="rgba(0,0,0,0.25)"
                            />
                            <rect
                              x={0}
                              y={0}
                              width={boxW}
                              height={boxH}
                              rx={10}
                              ry={10}
                              fill="rgba(10,16,28,0.90)"
                              stroke="rgba(255,255,255,0.14)"
                            />
                            {/* two-line: city bold, country normal (always two lines) */}
                            <text
                              x={pad}
                              y={pad}
                              fontSize={13}
                              fill="#FFFFFF"
                              fontWeight={700}
                              dominantBaseline="hanging"
                            >
                              {city}
                            </text>
                            <text
                              x={pad}
                              y={pad + line1H + gap}
                              fontSize={12}
                              fill="rgba(255,255,255,0.90)"
                              dominantBaseline="hanging"
                            >
                              {country}
                            </text>
                          </g>
                        );
                      }
                      // Desktop styling updated: dynamic, two lines, 4px padding
                      const city = String(d.name || "")
                        .trim()
                        .replace(/\s+/g, " ");
                      const country = String(d.country || "")
                        .trim()
                        .replace(/\s+/g, " ");
                      const est = (s: string) => Math.ceil(s.length * 6.6);
                      const pad = 4;
                      const line1H = 13;
                      const line2H = 12;
                      const gap = 2;
                      const boxW = Math.max(est(city), est(country)) + pad * 2;
                      const boxH = pad + line1H + gap + line2H + pad;
                      const dpx = Math.round(
                        Math.min(pos.x + 12, VIEW_W - 4 - boxW)
                      );
                      const dpy = Math.round(pos.y - (boxH - 6));
                      return (
                        <g transform={`translate(${dpx}, ${dpy})`}>
                          <rect
                            x={0}
                            y={1}
                            width={boxW}
                            height={boxH}
                            rx={8}
                            ry={8}
                            fill="rgba(0,0,0,0.25)"
                          />
                          <rect
                            x={0}
                            y={0}
                            width={boxW}
                            height={boxH}
                            rx={8}
                            ry={8}
                            fill="rgba(12,16,28,0.90)"
                            stroke="rgba(255,255,255,0.12)"
                          />
                          <text
                            x={pad}
                            y={pad}
                            fontSize={13}
                            fill="#FFFFFF"
                            fontWeight={700}
                            dominantBaseline="hanging"
                          >
                            {city}
                          </text>
                          <text
                            x={pad}
                            y={pad + line1H + gap}
                            fontSize={12}
                            fill="rgba(255,255,255,0.90)"
                            dominantBaseline="hanging"
                          >
                            {country}
                          </text>
                        </g>
                      );
                    })()
                  : null}
              </g>
            );
          })}

          {/* Mobile-only: show source label near user pin when location is detected */}
          {(() => {
            const isMobileViewport =
              typeof window !== "undefined" ? window.innerWidth < 640 : false;
            if (!isMobileViewport) return null;
            // Show when we have a detected or custom user location (non-empty label)
            if (
              !userPos ||
              userPos.lat === undefined ||
              userPos.lon === undefined
            )
              return null;
            const userP = pinPositions.get("user");
            if (!userP || !sourcePlaceLabel) return null;
            const [cityRaw, countryRaw] = String(sourcePlaceLabel || "")
              .split(",")
              .map((s) => s.trim());
            const city = (cityRaw || sourcePlaceLabel || "")
              .trim()
              .replace(/\s+/g, " ");
            const country = (countryRaw || "").trim().replace(/\s+/g, " ");
            const est = (s: string) => Math.ceil(s.length * 6.6);
            const pad = 4;
            const line1H = 13;
            const line2H = 12;
            const gap = 2;
            const boxW = Math.max(est(city), est(country)) + pad * 2;
            const boxH = pad + line1H + gap + line2H + pad;
            const px = Math.round(Math.min(userP.x + 12, VIEW_W - 4 - boxW));
            const py = Math.round(userP.y - (boxH - 6));
            return (
              <g transform={`translate(${px}, ${py})`}>
                {/* shadow without filters */}
                <rect
                  x={0}
                  y={1}
                  width={boxW}
                  height={boxH}
                  rx={10}
                  ry={10}
                  fill="rgba(0,0,0,0.25)"
                />
                <rect
                  x={0}
                  y={0}
                  width={boxW}
                  height={boxH}
                  rx={10}
                  ry={10}
                  fill="rgba(10,16,28,0.90)"
                  stroke="rgba(255,255,255,0.14)"
                />
                {/* split label on comma if present; always render two lines with trimmed content */}
                {(() => {
                  return (
                    <g>
                      <text
                        x={pad}
                        y={pad}
                        fontSize={13}
                        fill="#FFFFFF"
                        fontWeight={700}
                        dominantBaseline="hanging"
                      >
                        {city}
                      </text>
                      <text
                        x={pad}
                        y={pad + line1H + gap}
                        fontSize={12}
                        fill="rgba(255,255,255,0.90)"
                        dominantBaseline="hanging"
                      >
                        {country}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })()}
        </g>
      </svg>
      {showLocPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Location permission"
          className="absolute inset-0 z-20 grid place-items-center bg-black/30 backdrop-blur-[2px]"
        >
          <div className="w-[min(92vw,460px)] rounded-2xl border border-white/10 bg-[rgb(16,22,34)] p-4 sm:p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full grid place-items-center bg-sky-500/15">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path fill="#0ea5e9" d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Use your location for accurate routes
              </h3>
            </div>

            <p className="mt-2 text-sm text-white/80">
              We’ll center the globe and draw routes from your exact position.
              You can also enter coordinates manually.
            </p>

            {locError && (
              <p className="mt-2 text-xs text-red-300">{locError}</p>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={requestBrowserLocation}
                disabled={locRequesting || !isSecureContext}
                className="px-3.5 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {locRequesting ? "Detecting…" : "Use my location"}
              </button>

              <button
                onClick={() => setManualMode((v) => !v)}
                className="px-3 py-2 rounded-lg border border-white/10 text-white/90 text-sm hover:bg-white/5"
              >
                {manualMode ? "Hide manual entry" : "Enter manually"}
              </button>

              <button
                onClick={() => setShowLocPrompt(false)}
                className="ml-auto px-3 py-2 rounded-lg text-white/70 text-sm hover:text-white"
              >
                Not now
              </button>
            </div>

            {/* Manual lat/lon */}
            {manualMode && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-white/60">
                    Latitude (−90…90)
                  </span>
                  <input
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="19.0760"
                    className="px-2.5 py-2 rounded-md bg-white/5 text-white text-sm outline-none border border-white/10 focus:border-sky-500"
                    inputMode="decimal"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-white/60">
                    Longitude (−180…180)
                  </span>
                  <input
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="72.8777"
                    className="px-2.5 py-2 rounded-md bg-white/5 text-white text-sm outline-none border border-white/10 focus:border-sky-500"
                    inputMode="decimal"
                  />
                </label>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    onClick={applyManualLocation}
                    className="px-3.5 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15"
                  >
                    Use these coordinates
                  </button>
                </div>
              </div>
            )}

            {!isSecureContext && (
              <p className="mt-3 text-[11px] text-amber-200/90">
                Tip: Geolocation requires HTTPS (or localhost). You can still
                enter coordinates manually.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
