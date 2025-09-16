//
// components/next-section/next-section.tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import ScrollReveal from "@/components/react-bits/TextAnimations/ScrollReveal/ScrollReveal";

interface DestinationItem {
  id: string;
  title: string;
  location: string;
  meta?: string;
  imageSrc: string;
  width: number;
  height: number;
}

const DESTINATIONS: DestinationItem[] = [
  {
    id: "hollywood",
    title: "HOLLYWOOD",
    location: "Los Angeles, USA",
    meta: undefined,
    imageSrc: "/animations/images/image_120.webp",
    width: 1600,
    height: 1067,
  },
  {
    id: "beverly-hills",
    title: "BEVERLY HILLS",
    location: "Los Angeles, USA",
    meta: undefined,
    imageSrc: "/animations/images/image_150.webp",
    width: 1600,
    height: 1067,
  },
  {
    id: "banff",
    title: "BANFF NATIONAL PARK",
    location: "Alberta, Canada",
    meta: "6,641 km",
    imageSrc: "/animations/images/image_210.webp",
    width: 1600,
    height: 1067,
  },
];

export function NextSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ startX: number; scrollLeft: number } | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, scrollLeft: el.scrollLeft };
    setIsDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el || !dragState.current) return;
    const delta = e.clientX - dragState.current.startX;
    el.scrollLeft = dragState.current.scrollLeft - delta;
  }

  function onPointerUp(_: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el) return;
    setIsDragging(false);
    dragState.current = null;
  }

  return (
    <section
      className="bg-[#f5f5f5] text-[#0a0a0a] px-8 py-12 md:py-16"
      aria-labelledby="next-section-title"
    >
      <div className="grid [grid-template-columns:1fr_auto] gap-6 items-start max-w-[1400px] mx-auto mb-8">
        <div>
          <h2
            id="next-section-title"
            className="font-black leading-[0.95] tracking-[-0.02em] text-[clamp(40px,7vw,112px)] m-0 mb-4"
          >
            <span>Explore</span> <span>Worlds</span>
            <br />
            <span>Beyond</span> <span>Imagination</span>
          </h2>
          <ScrollReveal
            containerClassName="my-0"
            textClassName="max-w-[480px] text-[#2c2c2c] font-medium leading-[1.35] text-base md:text-lg"
            rotationEnd="bottom bottom"
            wordAnimationEnd="bottom bottom"
          >
            {
              "Step into a realm where the extraordinary becomes reality. From hidden valleys to untouched coastlines, these are places that defy imagination and stir the soul. Discover the world’s most remarkable wonders, carefully curated to inspire your next unforgettable journey."
            }
          </ScrollReveal>
        </div>
        <div className="self-center">
          <p className="text-[#444] font-bold tracking-[0.08em]">
            DRAG TO NAVIGATE
          </p>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={`max-w-[1400px] mx-auto grid [grid-auto-flow:column] [grid-auto-columns:minmax(280px,1fr)] gap-4 overflow-x-auto [overscroll-behavior-x:contain] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-label="Destination cards"
      >
        {DESTINATIONS.map((item) => (
          <article key={item.id} className="relative">
            <div className="relative aspect-[16/10] bg-black">
              <Image
                src={item.imageSrc}
                alt={item.location}
                width={item.width}
                height={item.height}
                className="object-cover w-full h-full"
                priority={false}
              />
              <div className="absolute top-4 left-4 text-white font-extrabold text-[14px] tracking-[0.06em]">
                {item.title}
              </div>
              <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between text-white font-bold text-[14px] tracking-[0.02em]">
                <span>{item.location}</span>
                {item.meta ? (
                  <span className="opacity-90">{item.meta}</span>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
