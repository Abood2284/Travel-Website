import React from "react";

const steps = [
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

export function HowItWorks() {
  return (
    <section className="relative isolate overflow-hidden bg-[#050505] py-20 text-white md:py-24">
      <div className="pointer-events-none absolute inset-x-0 -top-28 flex justify-center">
        <div className="relative h-52 w-[min(1200px,_110%)] overflow-hidden">
          <div className="absolute inset-0 animate-[glowPulse_10s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_0%,rgba(150,150,150,0.32),rgba(5,5,5,0)_55%),radial-gradient(circle_at_55%_18%,rgba(110,110,110,0.28),rgba(5,5,5,0)_62%),radial-gradient(circle_at_85%_10%,rgba(180,180,180,0.24),rgba(5,5,5,0)_60%)] opacity-70 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/30 to-transparent" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-28 flex justify-center">
        <div className="relative h-48 w-[min(1200px,_110%)] overflow-hidden">
          <div className="absolute inset-0 animate-[glowPulseReverse_11s_ease-in-out_infinite] bg-[radial-gradient(circle_at_15%_100%,rgba(140,140,140,0.3),rgba(5,5,5,0)_54%),radial-gradient(circle_at_60%_82%,rgba(120,120,120,0.26),rgba(5,5,5,0)_62%),radial-gradient(circle_at_90%_95%,rgba(190,190,190,0.22),rgba(5,5,5,0)_58%)] opacity-65 blur-[70px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent" />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 md:px-10">
        <header className="max-w-3xl space-y-4">
          <span className="text-[0.75rem] uppercase tracking-[0.4em] text-white/60">
            How it works
          </span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-tight text-white">
            From your first idea to a shareable itinerary in a few effortless beats.
          </h2>
          <p className="text-base text-white/70 md:text-lg">
            We designed this flow to stay delightfully minimal. Each step focuses on
            clarity so you can see exactly how your trip comes together while you
            explore.
          </p>
        </header>

        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] via-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] via-[#050505] to-transparent" />

          <div className="no-scrollbar flex snap-x snap-mandatory gap-0 overflow-x-auto pb-6 pl-6 pr-6 md:pl-12 md:pr-12">
            {steps.map((item) => (
              <article
                key={item.step}
                className="group relative isolate flex w-[calc(100vw-3rem)] max-w-[760px] shrink-0 snap-center flex-col gap-6 px-10 py-10 transition-transform duration-500 ease-out hover:-translate-y-1 md:w-[calc(100vw-6rem)]"
              >
                <div className="pointer-events-none absolute inset-0 -z-10 rounded-[36px] border border-white/10 bg-white/[0.04] shadow-[0_30px_55px_rgba(0,0,0,0.6)]" />
                <div className="pointer-events-none absolute inset-[12px] rounded-[28px] border border-white/15 bg-gradient-to-br from-white/[0.07] via-transparent to-white/[0.02]" />

                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  {item.step}
                </span>
                <h3 className="text-[clamp(1.35rem,2.6vw,1.9rem)] font-extrabold leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 md:text-base">{item.body}</p>

                <div className="mt-auto pt-6 text-sm font-medium text-white/65">
                  Swipe to see the next move →
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
