"use client";

import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

import animationData from "@/public/animations/lottie/Flight-Loader.json";

type FlightLoaderProps = {
  className?: string;
  fullscreen?: boolean;
  message?: string;
};

export default function FlightLoader({ className, fullscreen = false, message }: FlightLoaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const instance: AnimationItem = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData,
    });

    return () => {
      instance.destroy();
    };
  }, []);

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 backdrop-blur-md"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-6">
          <div
            ref={containerRef}
            className={className ?? "h-28 w-28 md:h-36 md:w-36"}
            style={{ width: "100%", height: "100%" }}
            aria-hidden
          />
          {message ? (
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/90">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
      role="img"
      aria-label="Loading animation"
    />
  );
}
