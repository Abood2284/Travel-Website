"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";
import { useTheme } from "next-themes";
import Image from "next/image";

export type Destination = {
  id: string;
  name: string;
  country: string;
  coords: { lat: number; lon: number };
};

type Point = { x: number; y: number };

const COLORS = {
  user: "#ef4444", // red-500
  userGlow: "rgba(239, 68, 68, 0.25)",
  dest: "#60a5fa", // blue-400
  destGlow: "rgba(96, 165, 250, 0.22)",
  path: "#9ccfff",
  gridDotLight: "#00000040",
  gridDotDark: "#FFFFFF40",
};

const DEFAULT_USER_POS = {
  lat: 19.076,
  lon: 72.8777,
  label: "Mumbai (fallback)",
};

// --- Projection utils (equirectangular) ---
const VIEW_W = 800; // internal viewBox width
const VIEW_H = 400; // internal viewBox height

function projectEquirect(lat: number, lon: number): Point {
  const x = ((lon + 180) * VIEW_W) / 360;
  const y = ((90 - lat) * VIEW_H) / 180;
  return { x, y };
}

// --- Great-circle helpers (slerp on unit sphere) ---
interface Vec3 {
  x: number;
  y: number;
  z: number;
}
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;
function latLonToVec(lat: number, lon: number): Vec3 {
  const φ = toRad(lat),
    λ = toRad(lon);
  return {
    x: Math.cos(φ) * Math.cos(λ),
    y: Math.cos(φ) * Math.sin(λ),
    z: Math.sin(φ),
  };
}
function normalize(v: Vec3): Vec3 {
  const m = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}
function vecToLatLon(v: Vec3) {
  const φ = Math.asin(Math.max(-1, Math.min(1, v.z)));
  const λ = Math.atan2(v.y, v.x);
  return { lat: toDeg(φ), lon: toDeg(λ) };
}
function greatCircleArc(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  segments = 96
): Array<{ lat: number; lon: number }> {
  const A = latLonToVec(a.lat, a.lon);
  const B = latLonToVec(b.lat, b.lon);
  const dot = Math.max(-1, Math.min(1, A.x * B.x + A.y * B.y + A.z * B.z));
  let theta = Math.acos(dot);
  if (theta < 1e-6) return [a, b];
  const sinTheta = Math.sin(theta);
  const out: Array<{ lat: number; lon: number }> = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const s1 = Math.sin((1 - t) * theta) / sinTheta;
    const s2 = Math.sin(t * theta) / sinTheta;
    const x = s1 * A.x + s2 * B.x;
    const y = s1 * A.y + s2 * B.y;
    const z = s1 * A.z + s2 * B.z;
    out.push(vecToLatLon(normalize({ x, y, z })));
  }
  return out;
}

// --- Default destinations (you can override via props) ---
const DEFAULT_DESTINATIONS: Destination[] = [
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    coords: { lat: -8.3405, lon: 115.092 },
  },
  {
    id: "united-states",
    name: "United States",
    country: "United States",
    coords: { lat: 37.0902, lon: -95.7129 },
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    coords: { lat: 25.2048, lon: 55.2708 },
  },
  {
    id: "thailand",
    name: "Thailand",
    country: "Thailand",
    coords: { lat: 15.87, lon: 100.9925 },
  },
  {
    id: "london",
    name: "London",
    country: "UK",
    coords: { lat: 51.5074, lon: -0.1278 },
  },
  {
    id: "france",
    name: "France",
    country: "France",
    coords: { lat: 46.2276, lon: 2.2137 },
  },
  {
    id: "japan",
    name: "Japan",
    country: "Japan",
    coords: { lat: 36.2048, lon: 138.2529 },
  },
  {
    id: "turkey",
    name: "Türkiye",
    country: "Turkey",
    coords: { lat: 38.9637, lon: 35.2433 },
  },
  {
    id: "china",
    name: "China",
    country: "China",
    coords: { lat: 35.8617, lon: 104.1954 },
  },
  {
    id: "greece",
    name: "Greece",
    country: "Greece",
    coords: { lat: 39.0742, lon: 21.8243 },
  },
  {
    id: "germany",
    name: "Germany",
    country: "Germany",
    coords: { lat: 51.1657, lon: 10.4515 },
  },
  {
    id: "netherlands",
    name: "Netherlands",
    country: "Netherlands",
    coords: { lat: 52.1326, lon: 5.2913 },
  },
  {
    id: "saudi-arabia",
    name: "Saudi Arabia",
    country: "Saudi Arabia",
    coords: { lat: 23.8859, lon: 45.0792 },
  },
  {
    id: "vietnam",
    name: "Vietnam",
    country: "Vietnam",
    coords: { lat: 14.0583, lon: 108.2772 },
  },
  {
    id: "switzerland",
    name: "Switzerland",
    country: "Switzerland",
    coords: { lat: 46.8182, lon: 8.2275 },
  },
  {
    id: "india",
    name: "India",
    country: "India",
    coords: { lat: 20.5937, lon: 78.9629 },
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    coords: { lat: 1.3521, lon: 103.8198 },
  },
  {
    id: "south-africa",
    name: "South Africa",
    country: "South Africa",
    coords: { lat: -30.5595, lon: 22.9375 },
  },
  {
    id: "australia",
    name: "Australia",
    country: "Australia",
    coords: { lat: -25.2744, lon: 133.7751 },
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    country: "New Zealand",
    coords: { lat: -40.9006, lon: 174.886 },
  },
];

export function DestinationMatrixSvg({
  destinations = DEFAULT_DESTINATIONS,
  heightVh = 72,
  className,
  lineColor = COLORS.path,
}: {
  destinations?: Destination[];
  heightVh?: number;
  className?: string;
  lineColor?: string;
}) {
  const { theme } = useTheme();
  const [active, setActive] = useState(false);
  const [userPos, setUserPos] = useState<{
    lat: number;
    lon: number;
    label?: string;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Lazy-activate when visible
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Geolocation with graceful fallback
  useEffect(() => {
    if (!active) return;
    let resolved = false;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (resolved) return;
          resolved = true;
          setUserPos({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            label: "You",
          });
        },
        () => {
          if (resolved) return;
          resolved = true;
          setUserPos(DEFAULT_USER_POS);
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 6_000 }
      );
    } else {
      setUserPos(DEFAULT_USER_POS);
    }
  }, [active]);

  // Build dotted background SVG string (memoized by theme)
  const dottedSvgDataUri = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    const svg = map.getSVG({
      radius: 0.22,
      color: theme === "dark" ? COLORS.gridDotDark : COLORS.gridDotLight,
      shape: "circle",
      backgroundColor: theme === "dark" ? "black" : "white",
    });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [theme]);

  // Selected destination + path geometry
  const selected = selectedId
    ? destinations.find((d) => d.id === selectedId)
    : null;
  const pathD = useMemo(() => {
    if (!userPos || !selected) return "";
    const arc = greatCircleArc(
      userPos,
      selected.coords,
      prefersReducedMotion ? 24 : 96
    ).map(({ lat, lon }) => projectEquirect(lat, lon));
    if (!arc.length) return "";
    const d = ["M", arc[0].x.toFixed(2), arc[0].y.toFixed(2)];
    for (let i = 1; i < arc.length; i++)
      d.push("L", arc[i].x.toFixed(2), arc[i].y.toFixed(2));
    return d.join(" ");
  }, [userPos, selected, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={className}
      style={{
        height: `${heightVh}vh`,
        maxHeight: 780,
        minHeight: 360,
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
        background: theme === "dark" ? "#000" : "#fff",
      }}
      aria-label="Destination matrix interactive map"
    >
      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          display: "flex",
          gap: 10,
          fontSize: 12,
          alignItems: "center",
          background: "rgba(10,14,24,0.52)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "6px 10px",
          borderRadius: 999,
          backdropFilter: "blur(8px)",
          color: "white",
        }}
      >
        <Dot color={COLORS.user} glow={COLORS.userGlow} /> You
        <span style={{ opacity: 0.25, margin: "0 6px" }}>•</span>
        <Dot color={COLORS.dest} glow={COLORS.destGlow} /> Destinations
      </div>

      {/* View All Destinations Button */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <a
          href="/destinations"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: "rgba(59, 130, 246, 0.9)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999,
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(59, 130, 246, 1)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 25px rgba(59, 130, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(59, 130, 246, 0.9)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(59, 130, 246, 0.3)";
          }}
        >
          <span>View All Destinations</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      {/* Background dotted map */}
      <Image
        src={dottedSvgDataUri}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height={VIEW_H}
        width={VIEW_W}
        draggable={false}
      />

      {/* Overlay SVG for routes + pins */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full absolute inset-0"
        aria-hidden
      >
        {/* Path gradient */}
        <defs>
          <linearGradient
            id="dmx-path-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id="dmx-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          </filter>
        </defs>

        {/* Animated great-circle path */}
        {pathD && (
          <g style={{ pointerEvents: "none" }}>
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#dmx-path-gradient)"
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 0.8, ease: "easeOut" }
              }
            />
          </g>
        )}

        {/* User pin */}
        {userPos && (
          <Pin
            x={projectEquirect(userPos.lat, userPos.lon).x}
            y={projectEquirect(userPos.lat, userPos.lon).y}
            color={COLORS.user}
            glow={COLORS.userGlow}
            label={userPos.label || "You"}
          />
        )}

        {/* Destination pins */}
        {destinations.map((d) => {
          const p = projectEquirect(d.coords.lat, d.coords.lon);
          const isSel = selected && d.id === selected.id;
          return (
            <g
              key={d.id}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
              onClick={() => setSelectedId(d.id)}
              aria-label={`${d.name}, ${d.country}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && setSelectedId(d.id)
              }
            >
              <Pin
                x={p.x}
                y={p.y}
                color={COLORS.dest}
                glow={COLORS.destGlow}
                r={isSel ? 6 : 4.5}
              />
              {isSel && (
                <Label x={p.x} y={p.y} text={d.name} below />
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}

// --- SVG helpers ---
function Pin({
  x,
  y,
  r = 5,
  color,
  glow,
  label,
}: {
  x: number;
  y: number;
  r?: number;
  color: string;
  glow: string;
  label?: string;
}) {
  return (
    <g>
      {/* glow */}
      <circle cx={x} cy={y} r={r * 3} fill={glow} />
      {/* core */}
      <circle cx={x} cy={y} r={r} fill={color} />
      {/* highlight */}
      <circle
        cx={x - r * 0.25}
        cy={y - r * 0.25}
        r={r * 0.25}
        fill="rgba(255,255,255,0.85)"
      />
      {label ? <Label x={x} y={y} text={label} /> : null}
    </g>
  );
}

function Label({
  x,
  y,
  text,
  below = false,
}: {
  x: number;
  y: number;
  text: string;
  below?: boolean;
}) {
  const pad = 6;
  // Using simple text with background rect
  return (
    <g
      transform={`translate(${Math.min(x + 12, VIEW_W - 4)}, ${
        below ? y + 18 : y - 18
      })`}
    >
      <rect
        x={-2}
        y={-12}
        width={text.length * 6.5 + pad * 2}
        height={22}
        rx={8}
        ry={8}
        fill="rgba(12,16,28,0.65)"
        stroke="rgba(255,255,255,0.08)"
      />
      <text
        x={pad}
        y={4}
        fontSize={12}
        fill="rgba(255,255,255,0.92)"
        dominantBaseline="middle"
      >
        {text}
      </text>
    </g>
  );
}

function Dot({ color, glow }: { color: string; glow: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        width: 10,
        height: 10,
        display: "inline-block",
        borderRadius: 999,
        background: color,
        boxShadow: `0 0 18px 6px ${glow}`,
      }}
    />
  );
}

export default DestinationMatrixSvg;
