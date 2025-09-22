"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { toPng } from "html-to-image";

type Step = {
  step: string;
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    step: "Step 01",
    title: "Tell us the vibe",
    body: "Placeholder copy that explains how travelers share their dream trip goals, mood, or must-see list.",
  },
  {
    step: "Step 02",
    title: "Pick your building blocks",
    body: "Descriptor text describing how the site gathers flights, stays, and experiences tailored to the traveler.",
  },
  {
    step: "Step 03",
    title: "Review the live preview",
    body: "Sample text showing how users can skim the instant itinerary and boarding pass draft before locking it in.",
  },
  {
    step: "Step 04",
    title: "Share or book when ready",
    body: "Placeholder line about saving, exporting, or sharing the curated trip in one or two taps.",
  },
];

let pixiPromise: Promise<typeof import("pixi.js")> | null = null;
function loadPixi() {
  if (!pixiPromise) {
    pixiPromise = import("pixi.js");
  }
  return pixiPromise;
}

type LiquidStepCardProps = {
  item: Step;
  isActive: boolean;
  shouldAnimate: boolean;
  isRevealed: boolean;
};

function createDisplacementSprite(pixi: typeof import("pixi.js"), size = 256) {
  const { Sprite, Texture, SCALE_MODES } = pixi;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Sprite.from(Texture.WHITE);
  }

  ctx.fillStyle = "rgba(40,40,40,0.9)";
  ctx.fillRect(0, 0, size, size);

  const drawWave = (
    stroke: string,
    amplitude: number,
    frequency: number,
    offsetY: number,
    phase: number
  ) => {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = size * 0.08;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const theta = (x / size) * Math.PI * 2 * frequency + phase;
      const y = offsetY + Math.sin(theta) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  drawWave("rgba(200,120,255,0.85)", size * 0.18, 1.2, size * 0.5, 0);
  drawWave("rgba(120,210,255,0.65)", size * 0.22, 1.6, size * 0.4, Math.PI / 3);
  drawWave("rgba(255,190,120,0.55)", size * 0.16, 2.1, size * 0.6, Math.PI / 2);

  ctx.globalAlpha = 0.4;
  const radial = ctx.createRadialGradient(
    size * 0.45,
    size * 0.45,
    size * 0.1,
    size * 0.6,
    size * 0.6,
    size * 0.8
  );
  radial.addColorStop(0, "rgba(255,255,255,0.45)");
  radial.addColorStop(1, "rgba(80,80,80,0.1)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, size, size);

  const texture = Texture.from(canvas);
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
  return new Sprite(texture);
}

const LiquidStepCard = React.forwardRef<HTMLDivElement, LiquidStepCardProps>(
  ({ item, isActive, shouldAnimate, isRevealed }, ref) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const animationLock = useRef(false);

    const clearExisting = useCallback(() => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (nodeRef.current) {
        nodeRef.current.style.opacity = "1";
      }
    }, []);

    useEffect(() => () => clearExisting(), [clearExisting]);

    const runDisplacement = useCallback(async () => {
      if (!nodeRef.current || !overlayRef.current || animationLock.current) {
        return;
      }

      if (
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ) {
        animationLock.current = false;
        return;
      }

      animationLock.current = true;

      const node = nodeRef.current;
      const overlay = overlayRef.current;

      try {
        const dataUrl = await toPng(node, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: "rgba(5,5,5,0)",
        });

        const pixi = await loadPixi();
        const { Application, Sprite, filters, WRAP_MODES } = pixi;

        const width = node.offsetWidth;
        const height = node.offsetHeight;

        const app = new Application({
          width,
          height,
          antialias: true,
          backgroundAlpha: 0,
        });

        overlay.innerHTML = "";
        overlay.appendChild(app.view as unknown as HTMLCanvasElement);
        overlay.style.opacity = "1";
        overlay.style.transition = "opacity 280ms ease";

        await new Promise((resolve) => setTimeout(resolve, 16));
        if (nodeRef.current) {
          nodeRef.current.style.opacity = "0";
        }

        const cardSprite = Sprite.from(dataUrl);
        cardSprite.width = width;
        cardSprite.height = height;

        const displacementSprite = createDisplacementSprite(pixi);
        displacementSprite.width = width;
        displacementSprite.height = height;
        displacementSprite.texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
        displacementSprite.alpha = 0.95;

        const displacementFilter = new filters.DisplacementFilter(
          displacementSprite
        );
        displacementFilter.padding = 260;
        displacementFilter.scale.set(200, 140);

        const startScaleX = 240;
        const startScaleY = 160;
        const endScaleX = 14;
        const endScaleY = 10;

        cardSprite.filters = [displacementFilter];
        app.stage.addChild(displacementSprite);
        app.stage.addChild(cardSprite);

        let elapsed = 0;
        const duration = 1500;
        let destroyed = false;
        let tick: ((delta: number) => void) | null = null;

        const cleanup = () => {
          if (destroyed) return;
          destroyed = true;
          if (app.ticker) {
            if (tick) {
              app.ticker.remove(tick);
            }
            app.ticker.stop();
          }
          tick = null;
          app.destroy(true, {
            children: true,
            texture: true,
            baseTexture: true,
          });
          overlay.style.opacity = "0";
          window.setTimeout(() => {
            overlay.innerHTML = "";
            overlay.style.opacity = "";
            overlay.style.transition = "";
          }, 280);
          if (nodeRef.current) {
            nodeRef.current.style.opacity = "1";
          }
          animationLock.current = false;
          cleanupRef.current = null;
        };

        cleanupRef.current = cleanup;

        tick = (delta: number) => {
          elapsed += (delta * 1000) / 60;
          displacementSprite.x += 1.8 * delta;
          displacementSprite.y += 0.9 * delta;
          displacementSprite.rotation += 0.0018 * delta;

          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          displacementFilter.scale.x = startScaleX * (1 - eased) + endScaleX;
          displacementFilter.scale.y = startScaleY * (1 - eased) + endScaleY;
          cardSprite.alpha = Math.min(1, eased * 1.08);
          if (nodeRef.current) {
            const nextOpacity = Math.min(1, 0.18 + eased * 0.95);
            nodeRef.current.style.opacity = nextOpacity.toString();
          }

          if (progress >= 1) {
            cleanup();
          }
        };

        app.ticker.add(tick);
      } catch (error) {
        console.error("Liquid card animation failed", error);
        animationLock.current = false;
        overlayRef.current?.style.removeProperty("opacity");
        overlayRef.current?.style.removeProperty("transition");
        cleanupRef.current = null;
        if (nodeRef.current) {
          nodeRef.current.style.opacity = "1";
        }
      }
    }, []);

    const hasMountedRef = useRef(false);
    useEffect(() => {
      hasMountedRef.current = true;
    }, []);

    useEffect(() => {
      if (!hasMountedRef.current) return;
      if (shouldAnimate) {
        clearExisting();
        void runDisplacement();
      }
    }, [clearExisting, shouldAnimate, runDisplacement]);

    const isVisible = isRevealed || shouldAnimate;

    return (
      <article
        ref={ref}
        data-active={isActive}
        className={clsx(
          "group relative isolate flex w-[calc(100vw-3rem)] max-w-[760px] shrink-0 snap-center transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] md:w-[calc(100vw-6rem)]",
          isVisible
            ? isActive
              ? "scale-[1.005] opacity-100"
              : "scale-[0.94] opacity-75"
            : "pointer-events-none scale-90 opacity-0"
        )}
      >
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[36px]"
        />

        <div
          ref={nodeRef}
          className="relative flex h-full flex-col overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] shadow-[0_30px_55px_rgba(0,0,0,0.6)] backdrop-blur-sm transition-opacity duration-400"
        >
          <div className="pointer-events-none absolute inset-[12px] rounded-[28px] border border-white/15 bg-gradient-to-br from-white/[0.07] via-transparent to-white/[0.02]" />
          <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-white/[0.08] opacity-0 transition-opacity duration-500 group-hover:opacity-10" />

          <div className="relative flex flex-1 flex-col gap-6 px-7 py-7 sm:px-9 sm:py-9">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              {item.step}
            </span>
            <h3 className="text-[clamp(1.35rem,2.6vw,1.9rem)] font-extrabold leading-tight text-white">
              {item.title}
            </h3>
            <p className="text-sm text-white/70 md:text-base">{item.body}</p>

            <div className="mt-auto pt-6 text-sm font-medium text-white/65">
              Swipe to see the next move →
            </div>
          </div>
        </div>
      </article>
    );
  }
);

LiquidStepCard.displayName = "LiquidStepCard";

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRaf = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [revealedFlags, setRevealedFlags] = useState<boolean[]>(() =>
    steps.map((_, idx) => idx === 0)
  );
  const hasActivatedOnce = useRef(false);
  const prevActiveRef = useRef(0);
  const introPlayedRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (scrollRaf.current) {
      cancelAnimationFrame(scrollRaf.current);
    }
    scrollRaf.current = requestAnimationFrame(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      const sliderCenter = slider.scrollLeft + slider.clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((node, index) => {
        if (!node) return;
        const cardCenter = node.offsetLeft + node.clientWidth / 2;
        const distance = Math.abs(sliderCenter - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
    });
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;

    handleScroll();
    slider.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      slider.removeEventListener("scroll", handleScroll);
      if (scrollRaf.current) {
        cancelAnimationFrame(scrollRaf.current);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!hasActivatedOnce.current) {
      hasActivatedOnce.current = true;
      prevActiveRef.current = activeIndex;
      return;
    }

    if (activeIndex === prevActiveRef.current) return;

    prevActiveRef.current = activeIndex;
    setAnimatingIndex((current) =>
      revealedFlags[activeIndex] ? current : activeIndex
    );
  }, [activeIndex, revealedFlags]);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl || introPlayedRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !introPlayedRef.current) {
          introPlayedRef.current = true;
          setAnimatingIndex(0);
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(sectionEl);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (animatingIndex === null) return undefined;

    const index = animatingIndex;
    setRevealedFlags((prev) => {
      if (index < 0 || index >= prev.length || prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });

    const timeout = window.setTimeout(() => {
      setAnimatingIndex((current) => (current === index ? null : current));
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [animatingIndex]);

  const registerCardRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      cardRefs.current[index] = node;
    },
    []
  );

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative isolate overflow-hidden bg-[#050505] py-20 text-white md:py-24"
    >
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 md:px-10">
        <header className="max-w-3xl space-y-4">
          <span className="text-[0.75rem] uppercase tracking-[0.4em] text-white/60">
            How it works
          </span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-tight text-white">
            From your first idea to a shareable itinerary in a few effortless
            beats.
          </h2>
          <p className="text-base text-white/70 md:text-lg">
            We designed this flow to stay delightfully minimal. Each step
            focuses on clarity so you can see exactly how your trip comes
            together while you explore.
          </p>
        </header>

        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] via-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] via-[#050505] to-transparent" />

          <div
            ref={sliderRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-0 overflow-x-auto pb-6 pl-6 pr-6 md:pl-12 md:pr-12"
          >
            {steps.map((item, index) => (
              <LiquidStepCard
                key={item.step}
                ref={registerCardRef(index)}
                item={item}
                isActive={activeIndex === index}
                shouldAnimate={animatingIndex === index}
                isRevealed={revealedFlags[index]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
