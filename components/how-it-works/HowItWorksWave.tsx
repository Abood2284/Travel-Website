"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Step = { title: string; note: string };

type Props = {
  steps?: Step[]; // exactly 4 are used
  heightVh?: number; // sticky viewport height in vh
  topOffsetVh?: number; // sticky top offset in vh
  className?: string;
};

const DEFAULT_STEPS: Step[] = [
  { title: "Book the form", note: "Share dates, people count, and basics." },
  {
    title: "We craft your plan",
    note: "Itinerary + airline/room preferences.",
  },
  { title: "Concierge call", note: "Human reviews, tweaks, and confirms." },
  { title: "Pay invoice", note: "Use your reference to complete payment." },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

export default function HowItWorksWaveTW({
  steps,
  heightVh = 72,
  topOffsetVh = 10,
  className,
}: Props) {
  const STEPS = useMemo<Step[]>(() => {
    const src = steps && steps.length ? steps : DEFAULT_STEPS;
    const four = src.slice(0, 4);
    while (four.length < 4) four.push(src[four.length % src.length]);
    return four;
  }, [steps]);

  const CYCLES = 4; // exactly 4 wavelengths
  const reduced = usePrefersReducedMotion();

  const stageRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const stepsGRef = useRef<SVGGElement | null>(null);
  const walkerRef = useRef<SVGGElement | null>(null);
  const descWrapRef = useRef<HTMLDivElement | null>(null);

  const [totalLen, setTotalLen] = useState(0);

  const peakTs = useMemo(
    () => Array.from({ length: CYCLES }, (_, k) => (k + 0.5) / CYCLES),
    []
  );
  const troughTs = useMemo(
    () => Array.from({ length: CYCLES }, (_, k) => (k + 1) / CYCLES),
    []
  );

  const buildWave = () => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const stepsG = stepsGRef.current;
    const descWrap = descWrapRef.current;
    if (!svg || !path || !stepsG || !descWrap) return;

    const vb = svg.viewBox.baseVal; // 0 0 1200 420
    const W = svg.clientWidth || vb.width;
    const H = svg.clientHeight || vb.height;

    const topPad = 50;
    const bottomPad = 70;
    const groundY = H - 70;
    const midY = groundY - (H - topPad - bottomPad) * 0.5;
    const A = Math.min(120, (H - topPad - bottomPad) * 0.42);
    const samplesPerCycle = 48;
    const N = CYCLES * samplesPerCycle;

    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = t * W;
      const y = midY - Math.sin(t * CYCLES * Math.PI * 2) * A;
      pts.push([x, y]);
    }

    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++)
      d += ` L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
    path.setAttribute("d", d);

    const len = Math.ceil(path.getTotalLength());
    setTotalLen(len);
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = reduced ? "0" : String(len);

    stepsG.innerHTML = "";
    descWrap.innerHTML = "";

    // peaks
    peakTs.forEach((t, i) => {
      const p = path.getPointAtLength(t * len);
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-i", String(i));
      g.setAttribute("transform", `translate(${p.x}, ${p.y - 18})`);
      g.setAttribute(
        "class",
        "opacity-0 transition-opacity duration-300 ease-[cubic-bezier(.22,.61,.36,1)]"
      );

      const circ = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circ.setAttribute("r", "10");
      circ.setAttribute(
        "class",
        "fill-black dark:fill-white stroke-current stroke-2"
      );
      g.appendChild(circ);

      const tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
      tx.setAttribute("text-anchor", "middle");
      tx.setAttribute("y", "-12");
      tx.setAttribute("class", "fill-current text-[12px]");
      tx.textContent = `Step ${i + 1}`;
      g.appendChild(tx);

      const tx2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      tx2.setAttribute("text-anchor", "middle");
      tx2.setAttribute("y", "26");
      tx2.setAttribute(
        "class",
        "fill-neutral-400 dark:fill-neutral-600 text-[12px]"
      );
      tx2.textContent = STEPS[i]?.title ?? `Step ${i + 1}`;
      g.appendChild(tx2);

      stepsG.appendChild(g);
    });

    // troughs descriptions
    troughTs.forEach((t, i) => {
      const p = path.getPointAtLength(t * len);
      const di = document.createElement("div");
      di.dataset.i = String(i);
      di.className = [
        "absolute -translate-x-1/2 border rounded-xl px-3 py-2 max-w-[240px] pointer-events-none",
        "bg-black text-white border-neutral-800",
        "dark:bg-white dark:text-black dark:border-neutral-200",
        "opacity-0 transition-opacity duration-300 ease-[cubic-bezier(.22,.61,.36,1)]",
      ].join(" ");
      const step = STEPS[i] ?? { title: `Step ${i + 1}`, note: "" };
      di.style.left = `${p.x}px`;
      di.style.top = `${p.y + 12}px`;
      di.innerHTML = `<div class='text-[11px] uppercase tracking-[.08em] text-neutral-400 dark:text-neutral-600'>${step.title}</div><div>${step.note}</div>`;
      descWrap.appendChild(di);
    });
  };

  const makeProgress = () => {
    const stage = stageRef.current;
    if (!stage) return () => 0;
    const rect = stage.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const end = start + rect.height - window.innerHeight;
    return () => {
      const y = window.scrollY;
      const raw = (y - start) / (end - start);
      return Math.max(0, Math.min(1, raw));
    };
  };

  const progressRef = useRef<() => number>(() => 0);

  const onScroll = () => {
    if (reduced) return;
    const path = pathRef.current;
    const walker = walkerRef.current;
    const stepsG = stepsGRef.current;
    const descWrap = descWrapRef.current;
    if (!path || !walker || !stepsG || !descWrap) return;

    const prog = progressRef.current();
    const drawTo = totalLen * prog;
    path.style.strokeDashoffset = String(Math.max(0, totalLen - drawTo));

    const lead = Math.max(0, drawTo - 8);
    const pt = path.getPointAtLength(lead);
    const next = path.getPointAtLength(Math.min(totalLen, lead + 2));
    const ang = (Math.atan2(next.y - pt.y, next.x - pt.x) * 180) / Math.PI;
    walker.setAttribute(
      "transform",
      `translate(${pt.x}, ${pt.y}) rotate(${ang})`
    );

    peakTs.forEach((t, i) => {
      const stepNode = stepsG.querySelector<SVGGElement>(`[data-i="${i}"]`);
      const descNode = descWrap.querySelector<HTMLDivElement>(
        `[data-i="${i}"]`
      );
      const show = prog >= t - 0.02;
      if (stepNode) stepNode.classList.toggle("opacity-100", show);
      if (descNode) descNode.classList.toggle("opacity-100", show);
    });
  };

  const tickingRef = useRef(false);
  const onScrollRaf = () => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      tickingRef.current = false;
      onScroll();
    });
  };

  useEffect(() => {
    buildWave();
    progressRef.current = makeProgress();
    onScroll();

    const sticky = stickyRef.current;
    if (!sticky) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          window.addEventListener("scroll", onScrollRaf, { passive: true });
          window.addEventListener("resize", onResizeThrottled);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(sticky);

    return () => {
      window.removeEventListener("scroll", onScrollRaf);
      window.removeEventListener("resize", onResizeThrottled);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, STEPS]);

  useEffect(() => {
    if (!reduced) return;
    buildWave();
    const path = pathRef.current;
    const walker = walkerRef.current;
    if (!path || !walker) return;
    path.style.strokeDashoffset = "0";
    const pt = path.getPointAtLength(totalLen);
    walker.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
    stepsGRef.current
      ?.querySelectorAll(`[data-i]`)
      .forEach((el) => el.classList.add("opacity-100"));
    descWrapRef.current
      ?.querySelectorAll(`[data-i]`)
      .forEach((el) => el.classList.add("opacity-100"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, totalLen]);

  const resizeTO = useRef<number | null>(null);
  const onResizeThrottled = () => {
    if (resizeTO.current) window.clearTimeout(resizeTO.current);
    resizeTO.current = window.setTimeout(() => {
      buildWave();
      progressRef.current = makeProgress();
      onScroll();
    }, 80);
  };

  const stageHeight = `${CYCLES * 100 + 20}vh`;

  return (
    <section
      className={["max-w-[1120px] mx-auto px-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-2">
        <span className="inline-block text-xs px-2.5 py-1 border border-neutral-800 dark:border-neutral-200 rounded-full text-neutral-400 dark:text-neutral-600">
          How it works
        </span>
        <h2 className="mt-2 mb-0 text-[28px] tracking-[.2px]">Wave journey</h2>
        <p className="m-0 text-neutral-400 dark:text-neutral-600">
          Scroll to reveal. Steps sit on peaks; explanations live in troughs.
        </p>
      </div>

      <div ref={stageRef} className="relative" style={{ height: stageHeight }}>
        <div
          ref={stickyRef}
          className="sticky border border-neutral-800 dark:border-neutral-200 rounded-2xl overflow-hidden bg-black text-white dark:bg-white dark:text-black"
          style={{ top: `${topOffsetVh}vh`, height: `${heightVh}vh` }}
          aria-label="Wave scrollytelling"
        >
          <div className="relative w-full h-full">
            <svg
              ref={svgRef}
              viewBox="0 0 1200 420"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full text-current"
            >
              <path
                d="M0 350H1200"
                className="fill-none stroke-neutral-800 dark:stroke-neutral-300"
              />
              <path
                ref={pathRef}
                d=""
                className="fill-none stroke-current"
                style={{ strokeWidth: 3 }}
              />

              <g ref={walkerRef} className="transform-gpu">
                <circle
                  r="7"
                  cx="0"
                  cy="0"
                  className="fill-black dark:fill-white stroke-current"
                  style={{ strokeWidth: 2 }}
                />
                <path
                  d="M0 7 L0 22 M0 12 L-7 18 M0 12 L7 18 M0 22 L-6 34 M0 22 L6 34"
                  className="fill-none stroke-current"
                  style={{ strokeWidth: 2 }}
                />
                <path
                  d="M7 -2 L18 -2 L14 -6 L18 -10 L7 -10 Z"
                  className="fill-none stroke-current"
                  style={{ strokeWidth: 2 }}
                />
              </g>

              <g ref={stepsGRef} />
            </svg>

            <div
              ref={descWrapRef}
              className="absolute inset-0 pointer-events-none"
            />
          </div>
        </div>

        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-600">
          Motion guardrails: reduced‑motion shows everything static; scroll work
          is requestAnimationFrame’d; path length cached; resize rebuilds;
          transform/opacity only.
        </p>
      </div>
    </section>
  );
}
