// component/trip-builder/TripBuilderReceipt.tsx
"use client";
import { daysInclusive, fmt, rid, within30Days } from "@/lib/trip-builder/core";
import { nextWeekend } from "@/lib/trip-builder/core";
import {
  AIRLINES,
  DESTINATIONS,
  NATIONALITIES,
  ORIGIN_CITIES,
  HOTEL_PREFERENCES,
  FLIGHT_CLASSES,
  VISA_STATUS,
  niceFact,
  whereIs,
} from "@/lib/trip-builder/guardrails";
import { TripPayload, TripSeed } from "@/lib/trip-builder/types";
import { useSound } from "@/sfx/SoundProvider";
import React, { useEffect, useReducer, useRef, useState } from "react";

import BoardingPass from "@/components/trip-builder/BoardingPass";

/**
 * TripBuilderReceipt
 * Production-lean, deterministic “receipt theme” chat that only offers curated answers.
 * - Pure React + TS. No external deps. No images. CSS-in-JS via <style jsx>.
 * - Auto-seed from Globe: pass `seed` prop to prefill fields (e.g., destination from map).
 * - Emits JSON payload via onSubmit. Also exposes onExitToForm to jump to a full form.
 * - Accessible: real buttons, focus management, reduced-motion friendly, keyboard back (Backspace).
 * - Local draft persistence (optional via `persistKey`).
 */

export type TripBuilderReceiptProps = {
  seed?: TripSeed;
  onSubmit?: (payload: TripPayload) => void;
  onExitToForm?: () => void; // "Skip chat, use full form"
  persistKey?: string; // localStorage key to auto-save/restore draft
  className?: string;
  originLabel?: string; // NEW
  title?: string;
  subtitle?: string;
  compactTranscript?: boolean;
  maxChatLines?: number;
  passengerName?: string;
};

/* ----------------------------- State machine ----------------------------- */

type StepId =
  | "fromLocation"
  | "destinationSeed"
  | "destinationSelect"
  | "dates"
  | "length"
  | "travellers"
  | "passengerName"
  | "nationality"
  | "airline"
  | "hotel"
  | "flightClass"
  | "visa"
  | "summary";

type ChatItem = { id: string; role: "bot" | "user"; text: string };

type State = {
  step: StepId;
  chat: ChatItem[];
  from?: string; // City, Country format
  destination?: string; // City, Country format
  nationality?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  nights?: number;
  adults?: number;
  kids?: number;
  airlinePref?: string;
  hotelPref?: string;
  flightClass?: string;
  visaStatus?: string;
  passengerName?: string;
  reducedMotion: boolean;
};

const initialState: State = {
  step: "fromLocation",
  chat: [],
  reducedMotion: false,
};

type Action =
  | { type: "SET_SEED"; seed: TripSeed }
  | { type: "PUSH_BOT"; text: string }
  | { type: "PUSH_USER"; text: string }
  | { type: "GOTO"; step: StepId }
  | { type: "SET_FIELD"; key: keyof State; value: any }
  | { type: "DERIVE_FROM_DATES" }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SEED": {
      const s = { ...state };
      const seed = action.seed || {};
      (Object.keys(seed) as (keyof TripSeed)[]).forEach((k) => {
        s[k] = seed[k] as any;
      });
      if (seed.destination) {
        s.step = "destinationSeed";
        s.chat = [
          {
            id: "b0",
            role: "bot",
            text: `Got the route from the globe. Destination: ${seed.destination}.`,
          },
        ];
      }
      return s;
    }
    case "PUSH_BOT":
      return {
        ...state,
        chat: [...state.chat, { id: rid(), role: "bot", text: action.text }],
      };
    case "PUSH_USER":
      return {
        ...state,
        chat: [...state.chat, { id: rid(), role: "user", text: action.text }],
      };
    case "GOTO":
      return { ...state, step: action.step };
    case "SET_FIELD": {
      const next: State = { ...state, [action.key]: action.value } as State;
      return next;
    }
    case "DERIVE_FROM_DATES": {
      if (state.startDate && state.endDate) {
        const d = daysInclusive(state.startDate, state.endDate);
        const n = Math.max(0, d - 1);
        return { ...state, days: d, nights: n };
      }
      return state;
    }
    case "RESET": {
      return { ...initialState, reducedMotion: state.reducedMotion };
    }
    default:
      return state;
  }
}
/* ----------------------------- Boarding pass helpers ----------------------------- */
// Minimal IATA guesses for our curated destinations; fallback derives from name.
const IATA: Record<string, string> = {
  "Dubai, UAE": "DXB",
  "Singapore, Singapore": "SIN",
  "Maldives, Maldives": "MLE",
  "Bali, Indonesia": "DPS",
  "Bangkok, Thailand": "BKK",
  "Phuket, Thailand": "HKT",
  "Istanbul, Turkey": "IST",
  "Doha, Qatar": "DOH",
  "Mumbai, India": "BOM",
  "Delhi, India": "DEL",
  "Bangalore, India": "BLR",
  "Chennai, India": "MAA",
  "Kolkata, India": "CCU",
  "Hyderabad, India": "HYD",
  "Pune, India": "PNQ",
  "Ahmedabad, India": "AMD",
  "New York, USA": "JFK",
  "London, UK": "LHR",
  "Paris, France": "CDG",
  "Amsterdam, Netherlands": "AMS",
  "Rome, Italy": "FCO",
  "Zurich, Switzerland": "ZRH",
  "Cairo, Egypt": "CAI",
  "Baku, Azerbaijan": "GYD",
  "Mauritius, Mauritius": "MRU",
  "Tokyo, Japan": "NRT",
  "Sydney, Australia": "SYD",
};
function iataFor(label?: string) {
  const n = (label || "").trim();
  // If it's a placeholder like "Your City", "Your Location", or "You", don't invent "YOU"
  if (
    !n ||
    /^your\b/i.test(n) ||
    /location|city|custom/i.test(n) ||
    /^you$/i.test(n)
  )
    return "—";
  if (IATA[n]) return IATA[n];
  return n
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
}

function backOne(dispatch: React.Dispatch<Action>, state: State) {
  const order: StepId[] = [
    "fromLocation",
    "destinationSeed",
    "destinationSelect",
    "dates",
    "length",
    "travellers",
    "passengerName",
    "nationality",
    "airline",
    "hotel",
    "flightClass",
    "visa",
    "summary",
  ];
  const i = order.indexOf(state.step);
  if (i <= 0) return; // nothing to go back to
  const prev = order[i - 1];
  dispatch({ type: "GOTO", step: prev });
}

function displayCity(label?: string) {
  const n = (label || "").trim();
  if (!n) return "—";
  const idx = n.indexOf(",");
  if (idx === -1) return n; // no country provided
  const city = n.slice(0, idx).trim();
  const country = n.slice(idx + 1).trim();
  // If city and country are the same (e.g., "Singapore, Singapore"), or by design we prefer city-only
  if (city.toLowerCase() === country.toLowerCase()) return city;
  return city; // default to city-only display for the boarding pass
}

/* ----------------------------- Component ----------------------------- */

const TripBuilderReceipt: React.FC<TripBuilderReceiptProps> = ({
  seed,
  onSubmit,
  onExitToForm,
  persistKey,
  className,
  originLabel,
  title,
  subtitle,
  compactTranscript,
  maxChatLines,
  passengerName,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { play } = useSound();
  const prevLenRef = useRef(0);
  // tear-off ui
  const [isTearing, setIsTearing] = useState(false);
  const [isTorn, setIsTorn] = useState(false);
  const TEAR_MS = 700; // keep in sync with CSS animation

  // play on new chat line
  useEffect(() => {
    if (state.chat.length > prevLenRef.current) {
      play("print");
      prevLenRef.current = state.chat.length;
    } else {
      prevLenRef.current = state.chat.length;
    }
  }, [state.chat.length, play]);

  // when entering summary, ding and tear the receipt out, then show pass
  useEffect(() => {
    if (state.step === "summary") {
      play("ding");
      startTear();
    }
  }, [state.step, play]);

  // Re-collapse transcript on each step change when compact mode is enabled
  useEffect(() => {
    if (compactTranscript) setShowAll(false);
  }, [state.step, compactTranscript]);

  // later when you implement tear-off:
  // play("tear");
  const paperRef = useRef<HTMLDivElement>(null);

  // Reduced motion snapshot
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () =>
      dispatch({ type: "SET_FIELD", key: "reducedMotion", value: mq.matches });
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Seed from props
  useEffect(() => {
    dispatch({ type: "SET_SEED", seed: seed || {} });
  }, [seed?.destination, seed?.startDate, seed?.endDate]);

  // Persist draft
  useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const saved = JSON.parse(raw) as TripSeed;
        dispatch({ type: "SET_SEED", seed: saved });
      }
    } catch {}
    // save on change
  }, []);
  useEffect(() => {
    if (!persistKey) return;
    const draft: TripSeed = {
      from: state.from,
      destination: state.destination,
      nationality: state.nationality,
      startDate: state.startDate,
      endDate: state.endDate,
      days: state.days,
      adults: state.adults,
      kids: state.kids,
      airlinePref: state.airlinePref,
      hotelPref: state.hotelPref,
      flightClass: state.flightClass,
      visaStatus: state.visaStatus,
      passengerName: state.passengerName,
    };
    try {
      localStorage.setItem(persistKey, JSON.stringify(draft));
    } catch {}
  }, [persistKey, state]);

  // Scroll on new chat
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.chat.length, state.step]);

  // UI helpers
  const pushBot = (text: string) => dispatch({ type: "PUSH_BOT", text });
  const pushUser = (text: string) => dispatch({ type: "PUSH_USER", text });

  // First prompt per step
  useEffect(() => {
    if (state.step === "fromLocation") {
      pushBot("Where are you traveling from?");
    } else if (state.step === "destinationSeed") {
      pushBot(`Want to keep ${state.destination}?`);
    } else if (state.step === "destinationSelect") {
      pushBot("Pick a destination");
    } else if (state.step === "dates") {
      pushBot("When do you plan to travel?");
    } else if (state.step === "length") {
      pushBot("How long are we talking?");
    } else if (state.step === "travellers") {
      pushBot("Who's traveling?");
    } else if (state.step === "passengerName") {
      pushBot("What's the passenger name?");
    } else if (state.step === "nationality") {
      pushBot("What's your nationality?");
    } else if (state.step === "airline") {
      pushBot("Any airline preference?");
    } else if (state.step === "hotel") {
      pushBot("Hotel preference?");
    } else if (state.step === "flightClass") {
      pushBot("Flight class preference?");
    } else if (state.step === "visa") {
      pushBot("Do you have a visa?");
    } else if (state.step === "summary") {
      pushBot("All set. Here's your boarding pass preview.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  // Actions
  const handleSubmit = () => {
    const payload: TripPayload = {
      from: state.from || "",
      destination: state.destination || "",
      nationality: state.nationality || "",
      startDate: state.startDate || "",
      endDate: state.endDate || "",
      days: state.days || 1,
      nights: state.nights || Math.max(0, (state.days || 1) - 1),
      adults: state.adults || 1,
      kids: state.kids || 0,
      airlinePref: state.airlinePref || "Any",
      hotelPref: state.hotelPref || "3 Star",
      flightClass: state.flightClass || "Economy",
      visaStatus: state.visaStatus || "N/A",
      passengerName: state.passengerName || "GUEST",
      createdAt: new Date().toISOString(),
    };
    onSubmit?.(payload);
  };

  // Start tear animation, then reveal pass-only view
  function startTear() {
    if (isTearing || isTorn) return;
    play("tear");
    setIsTearing(true);
    // after animation, hide receipt and show pass-only
    setTimeout(() => {
      setIsTearing(false);
      setIsTorn(true);
    }, TEAR_MS);
  }

  // Restart everything and clear draft
  function resetAll() {
    try {
      if (persistKey) localStorage.removeItem(persistKey);
    } catch {}
    setIsTorn(false);
    setIsTearing(false);
    dispatch({ type: "RESET" });
  }

  // Option handlers per step
  function nextFromDestinationSeed(choice: "keep" | "change" | "where") {
    if (choice === "keep") {
      pushUser(`Keep ${state.destination}`);
      if (state.destination) pushBot(niceFact(state.destination));
      dispatch({ type: "GOTO", step: "dates" });
      return;
    }
    if (choice === "where") {
      pushUser("Where is that?");
      if (state.destination) pushBot(whereIs(state.destination));
      // stay on step; give follow-up choice
      return;
    }
    pushUser("Change destination");
    dispatch({ type: "GOTO", step: "destinationSelect" });
  }

  function selectDestination(dest: string) {
    pushUser(dest);
    dispatch({ type: "SET_FIELD", key: "destination", value: dest });
    pushBot(`Nice. ${dest} it is.`);
    pushBot(niceFact(dest));
    dispatch({ type: "GOTO", step: "dates" });
  }

  function datesPreset(choice: "nextWeekend" | "within30" | "pick") {
    if (choice === "pick") return; // picker UI below
    const { start, end } =
      choice === "nextWeekend" ? nextWeekend() : within30Days();
    dispatch({ type: "SET_FIELD", key: "startDate", value: start });
    dispatch({ type: "SET_FIELD", key: "endDate", value: end });
    dispatch({ type: "DERIVE_FROM_DATES" });
    pushUser(choice === "nextWeekend" ? "Next weekend" : "Within 30 days");
    dispatch({ type: "GOTO", step: "length" });
  }

  function lengthPreset(days: 3 | 5 | 7) {
    pushUser(`${days}D/${days - 1}N`);
    dispatch({ type: "SET_FIELD", key: "days", value: days });
    dispatch({
      type: "SET_FIELD",
      key: "nights",
      value: Math.max(0, days - 1),
    });
    dispatch({ type: "GOTO", step: "travellers" });
  }

  function travPreset(kind: "1a" | "2a" | "fam") {
    if (kind === "1a") {
      pushUser("1 adult");
      dispatch({ type: "SET_FIELD", key: "adults", value: 1 });
      dispatch({ type: "SET_FIELD", key: "kids", value: 0 });
    }
    if (kind === "2a") {
      pushUser("2 adults");
      dispatch({ type: "SET_FIELD", key: "adults", value: 2 });
      dispatch({ type: "SET_FIELD", key: "kids", value: 0 });
    }
    if (kind === "fam") {
      pushUser("Family");
      dispatch({ type: "SET_FIELD", key: "adults", value: 2 });
      dispatch({ type: "SET_FIELD", key: "kids", value: 1 });
    }
    dispatch({ type: "GOTO", step: "passengerName" });
  }

  function nationalitySelect(n: string) {
    pushUser(n);
    dispatch({ type: "SET_FIELD", key: "nationality", value: n });
    dispatch({ type: "GOTO", step: "airline" });
  }

  function airlineSelect(a: string) {
    pushUser(a);
    dispatch({ type: "SET_FIELD", key: "airlinePref", value: a });
    dispatch({ type: "GOTO", step: "hotel" });
  }

  function selectFromLocation(from: string) {
    pushUser(from);
    dispatch({ type: "SET_FIELD", key: "from", value: from });
    dispatch({ type: "GOTO", step: "destinationSelect" });
  }

  function selectPassengerName(name: string) {
    pushUser(name);
    dispatch({ type: "SET_FIELD", key: "passengerName", value: name });
    dispatch({ type: "GOTO", step: "nationality" });
  }

  function selectHotel(hotel: string) {
    pushUser(hotel);
    dispatch({ type: "SET_FIELD", key: "hotelPref", value: hotel });
    dispatch({ type: "GOTO", step: "flightClass" });
  }

  function selectFlightClass(flightClass: string) {
    pushUser(flightClass);
    dispatch({ type: "SET_FIELD", key: "flightClass", value: flightClass });
    dispatch({ type: "GOTO", step: "visa" });
  }

  function selectVisa(visa: string) {
    pushUser(visa);
    dispatch({ type: "SET_FIELD", key: "visaStatus", value: visa });
    dispatch({ type: "GOTO", step: "summary" });
  }

  function toSummary() {
    dispatch({ type: "GOTO", step: "summary" });
  }

  const [showAll, setShowAll] = useState(false);
  const maxLines = Math.max(3, maxChatLines ?? 6);
  const visibleCount = compactTranscript
    ? showAll
      ? state.chat.length
      : Math.min(state.chat.length, maxLines)
    : state.chat.length;
  const chatHiddenCount =
    compactTranscript && !showAll
      ? Math.max(0, state.chat.length - visibleCount)
      : 0;
  const chatToShow = state.chat.slice(-visibleCount);

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className={className}>
      {/* When torn: show pass-only view and exit early */}
      {isTorn && (
        <div className="pass-stage" role="region" aria-label="Boarding pass">
          <BoardingPass
            fromCity={displayCity(state.from || originLabel || "Your City")}
            toCity={displayCity(state.destination || "—")}
            iataFrom={iataFor(state.from || originLabel)}
            iataTo={iataFor(state.destination)}
            passengerName={state.passengerName || passengerName || "GUEST"}
            visaStatus={state.visaStatus || "N/A"}
            adults={state.adults ?? 1}
            children={state.kids ?? 0}
            airline={state.airlinePref || "—"}
            nationality={state.nationality || "—"}
            hotelPref={state.hotelPref || "3 Star"}
            flightClass={state.flightClass || "Economy"}
          />
          <div className="pass-actions">
            <button className="cta" onClick={resetAll}>
              Restart
            </button>
            <button className="linkish" onClick={() => setIsTorn(false)}>
              Back to chat
            </button>
          </div>
        </div>
      )}
      {!isTorn && (
        <>
          <div
            className="tb-head"
            role="group"
            aria-label="Trip Builder header"
          >
            <h2 className="tb-title font-black font-3xl">
              {title ?? "Smart Trip Builder"}
            </h2>
            <p className="tb-sub">
              {subtitle ??
                "Conversational, receipt-style planner. Choose answers and we prep your trip + a boarding pass preview."}
            </p>
          </div>
          <div
            className={`receipt${isTearing ? " tearing" : ""}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                const target = e.target as HTMLElement | null;
                const tag = target?.tagName?.toLowerCase();
                const isTyping = !!(
                  target &&
                  (target.isContentEditable ||
                    tag === "input" ||
                    tag === "textarea" ||
                    tag === "select")
                );
                if (!isTyping) {
                  e.preventDefault();
                  backOne(dispatch, state);
                }
              }
            }}
          >
            <div className="header">
              <span className="brand-mini">
                {title || "TRIP BUILDER • RECEIPT"}
              </span>
              <div className="rowy">
                {onExitToForm && (
                  <button className="linkish" onClick={onExitToForm}>
                    {subtitle || "Skip chat, use full form"}
                  </button>
                )}
                <div className="barcode" aria-hidden />
              </div>
            </div>
            <div className="perfs" aria-hidden />
            <div
              className={`tear-line${isTearing ? " show" : ""}`}
              aria-hidden
            />

            <div
              ref={paperRef}
              className={`paper${compactTranscript ? " no-scroll" : ""}`}
              role="log"
              aria-live="polite"
            >
              {chatHiddenCount > 0 && (
                <div className="line faded">
                  <span>… {chatHiddenCount} earlier lines hidden</span>
                  <button
                    className="linkish small"
                    onClick={() => setShowAll(true)}
                  >
                    Show all
                  </button>
                </div>
              )}
              {/* Printed chat */}
              {chatToShow.map((m) => (
                <div key={m.id} className={`line ${m.role}`} data-print>
                  <span className="meta">
                    {m.role === "bot" ? "BOT" : "YOU"}
                  </span>
                  <span className="text">{m.text}</span>
                </div>
              ))}

              {compactTranscript && showAll && state.chat.length > maxLines && (
                <div className="line faded">
                  <span>Showing all {state.chat.length} lines</span>
                  <button
                    className="linkish small"
                    onClick={() => setShowAll(false)}
                  >
                    Show less
                  </button>
                </div>
              )}

              {/* Active step UI */}
              {state.step === "fromLocation" && (
                <div className="block print-reveal">
                  <div className="q">Traveling from</div>
                  <div className="opts">
                    {ORIGIN_CITIES.map((city) => (
                      <button
                        key={city}
                        className="opt"
                        onClick={() => selectFromLocation(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.step === "destinationSeed" && (
                <div className="block print-reveal">
                  <div className="q">Confirm destination</div>
                  <div className="opts">
                    <button
                      className="opt"
                      onClick={() => nextFromDestinationSeed("keep")}
                    >
                      Keep {state.destination}
                    </button>
                    <button
                      className="opt"
                      onClick={() => nextFromDestinationSeed("where")}
                    >
                      Where is {state.destination}?
                    </button>
                    <button
                      className="opt"
                      onClick={() => nextFromDestinationSeed("change")}
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {state.step === "destinationSelect" && (
                <div className="block print-reveal">
                  <div className="q">Pick destination</div>
                  <div className="opts">
                    {DESTINATIONS.map((d) => (
                      <button
                        key={d}
                        className="opt"
                        onClick={() => selectDestination(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.step === "dates" && (
                <div className="block print-reveal">
                  <div className="q">Travel dates</div>
                  <div className="opts">
                    <button
                      className="opt"
                      onClick={() => datesPreset("nextWeekend")}
                    >
                      Next weekend
                    </button>
                    <button
                      className="opt"
                      onClick={() => datesPreset("within30")}
                    >
                      Within 30 days
                    </button>
                    <button className="opt" onClick={() => datesPreset("pick")}>
                      Pick exact
                    </button>
                  </div>
                  <div className="inline">
                    <span className="hint">Pick:</span>
                    <input
                      type="date"
                      value={state.startDate || ""}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          key: "startDate",
                          value: e.target.value,
                        })
                      }
                    />
                    <input
                      type="date"
                      value={state.endDate || ""}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          key: "endDate",
                          value: e.target.value,
                        })
                      }
                    />
                    <button
                      className="cta"
                      onClick={() => {
                        dispatch({ type: "DERIVE_FROM_DATES" });
                        dispatch({ type: "GOTO", step: "length" });
                      }}
                    >
                      Set dates
                    </button>
                  </div>
                </div>
              )}

              {state.step === "length" && (
                <div className="block print-reveal">
                  <div className="q">Trip length</div>
                  <div className="opts">
                    <button className="opt" onClick={() => lengthPreset(3)}>
                      3D/2N
                    </button>
                    <button className="opt" onClick={() => lengthPreset(5)}>
                      5D/4N
                    </button>
                    <button className="opt" onClick={() => lengthPreset(7)}>
                      7D/6N
                    </button>
                  </div>
                  <div className="inline">
                    <span className="hint">Days:</span>
                    <input
                      type="number"
                      min={1}
                      value={state.days ?? 3}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          key: "days",
                          value: Math.max(1, +e.target.value || 1),
                        })
                      }
                    />
                    <button
                      className="cta"
                      onClick={() =>
                        dispatch({ type: "GOTO", step: "travellers" })
                      }
                    >
                      Set length
                    </button>
                  </div>
                </div>
              )}

              {state.step === "travellers" && (
                <div className="block print-reveal">
                  <div className="q">Travellers</div>
                  <div className="opts">
                    <button className="opt" onClick={() => travPreset("1a")}>
                      1 adult
                    </button>
                    <button className="opt" onClick={() => travPreset("2a")}>
                      2 adults
                    </button>
                    <button className="opt" onClick={() => travPreset("fam")}>
                      Family
                    </button>
                  </div>
                  <div className="inline">
                    <span className="hint">Adults</span>
                    <input
                      type="number"
                      min={1}
                      value={state.adults ?? 2}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          key: "adults",
                          value: Math.max(1, +e.target.value || 1),
                        })
                      }
                    />
                    <span className="hint">Kids</span>
                    <input
                      type="number"
                      min={0}
                      value={state.kids ?? 0}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          key: "kids",
                          value: Math.max(0, +e.target.value || 0),
                        })
                      }
                    />
                    <button
                      className="cta"
                      onClick={() =>
                        dispatch({ type: "GOTO", step: "nationality" })
                      }
                    >
                      Set
                    </button>
                  </div>
                </div>
              )}

              {state.step === "passengerName" && (
                <div className="block print-reveal">
                  <div className="q">Passenger name</div>
                  <div className="inline">
                    <input
                      type="text"
                      placeholder="Enter passenger name"
                      value={state.passengerName || ""}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          key: "passengerName",
                          value: e.target.value,
                        })
                      }
                    />
                    <button
                      className="cta"
                      onClick={() =>
                        dispatch({ type: "GOTO", step: "nationality" })
                      }
                    >
                      Set name
                    </button>
                  </div>
                </div>
              )}

              {state.step === "nationality" && (
                <div className="block print-reveal">
                  <div className="q">Nationality</div>
                  <div className="opts">
                    {NATIONALITIES.map((n) => (
                      <button
                        key={n}
                        className="opt"
                        onClick={() => nationalitySelect(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.step === "airline" && (
                <div className="block print-reveal">
                  <div className="q">Airline</div>
                  <div className="opts">
                    {AIRLINES.map((a) => (
                      <button
                        key={a}
                        className="opt"
                        onClick={() => airlineSelect(a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.step === "hotel" && (
                <div className="block print-reveal">
                  <div className="q">Hotel preference</div>
                  <div className="opts">
                    {HOTEL_PREFERENCES.map((h) => (
                      <button
                        key={h}
                        className="opt"
                        onClick={() => selectHotel(h)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.step === "flightClass" && (
                <div className="block print-reveal">
                  <div className="q">Flight class</div>
                  <div className="opts">
                    {FLIGHT_CLASSES.map((c) => (
                      <button
                        key={c}
                        className="opt"
                        onClick={() => selectFlightClass(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.step === "visa" && (
                <div className="block print-reveal">
                  <div className="q">Visa status</div>
                  <div className="opts">
                    {VISA_STATUS.map((v) => (
                      <button
                        key={v}
                        className="opt"
                        onClick={() => selectVisa(v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        /* Full-section, non-sticky pass-stage for in-flow boarding pass */
        .pass-stage {
          position: relative;
          width: 100%;
          min-height: 100vh; /* occupy viewport height without sticking */
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          z-index: 1;
          animation: passReveal 0.36s ease-out both;
        }
        .pass-actions {
          position: absolute;
          right: 16px;
          bottom: 16px;
          display: flex;
          gap: 8px;
        }
        .receipt {
          background: #fff;
          color: #111827;
          border: 1px solid #111;
          border-radius: 14px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
          padding: 14px;
          max-width: 720px;
          margin: 0 auto;
          position: relative;
        }
        /* Tear animation */
        .receipt.tearing {
          animation: tearOff 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          will-change: transform, opacity, clip-path;
        }
        @keyframes tearOff {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          60% {
            transform: translateY(-36%);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-85%);
            opacity: 0;
          }
        }
        .tear-line {
          height: 14px;
          margin: 0 -6px 10px;
          background: radial-gradient(
              circle at 6px 7px,
              #111 6px,
              transparent 7px
            )
            left center/12px 14px repeat-x;
          opacity: 0;
          transition: opacity 0.18s ease-out;
        }
        .tear-line.show {
          opacity: 0.5;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .brand-mini {
          font-weight: 800;
          letter-spacing: 0.6px;
          font-size: 12px;
        }
        .barcode {
          height: 28px;
          width: 140px;
          background: repeating-linear-gradient(
            90deg,
            #111 0 2px,
            transparent 2px 4px
          );
          opacity: 0.85;
          border-radius: 2px;
        }
        .perfs {
          height: 10px;
          margin: 8px -6px;
          background: radial-gradient(
              circle at 8px 5px,
              transparent 6px,
              #111 6px
            )
            left top/16px 10px repeat-x;
          opacity: 0.18;
        }
        .paper {
          background: repeating-linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.03) 0 28px,
            rgba(0, 0, 0, 0.055) 28px 29px
          );
          border: 1px dashed #111;
          padding: 12px;
          border-radius: 10px;
          max-height: 62vh;
          overflow: auto;
        }
        .paper.no-scroll {
          max-height: initial;
          overflow: visible;
        }
        .line {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px dashed #111;
          padding: 6px 0;
          align-items: center;
        }
        /* Uniform label/value spacing in summary */
        .summary .line {
          grid-template-columns: 100px 1fr;
          display: grid;
          align-items: start;
          padding: 8px 0;
          gap: 14px;
        }
        .summary .line span {
          margin-right: 0;
        }
        .summary .line b {
          line-height: 1.35;
        }
        .linkish.small {
          padding: 6px 10px;
          font-size: 12px;
        }
        .line.faded {
          opacity: 0.75;
        }
        .q {
          font-weight: 800;
          letter-spacing: 0.4px;
          font-size: 12px;
          margin: 8px 0 6px;
          text-transform: uppercase;
        }
        .opts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 6px 0 10px;
        }
        .opt {
          padding: 8px 12px;
          border: 1px solid #111;
          border-radius: 999px;
          background: #fff;
          color: #111;
          cursor: pointer;
        }
        .opt[aria-pressed="true"],
        .opt:focus-visible {
          background: #111;
          color: #fff;
          outline: none;
        }
        .inline {
          display: inline-flex;
          gap: 8px;
          align-items: center;
        }
        .hint {
          font-size: 11px;
          opacity: 0.7;
        }
        .rowy {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .linkish {
          background: transparent;
          border: 1px dashed #111;
          border-radius: 999px;
          padding: 8px 12px;
          cursor: pointer;
        }
        .cta {
          background: #111;
          color: #fff;
          border: 1px solid #111;
          border-radius: 10px;
          padding: 10px 14px;
          cursor: pointer;
        }
        .actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .block {
          margin: 6px 0;
        }

        .pass {
          margin: 12px 0;
          border: 1px solid #111;
          border-radius: 12px;
          overflow: hidden;
        }
        /* Airline-style horizontal ticket */
        .ticket {
          display: grid;
          grid-template-columns: 1fr 260px;
          grid-template-rows: auto 1fr;
          border: 1px solid #111;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }
        .brand-band {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #111; /* set a color here to theme */
          color: #fff;
          letter-spacing: 0.4px;
          font-weight: 800;
        }
        .brand-left {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .brand-plane {
          font-size: 14px;
          opacity: 0.9;
        }
        .brand-title {
          font-size: 12px;
          opacity: 0.9;
        }
        .brand-name {
          font-size: 12px;
        }

        .ticket-main {
          padding: 12px;
          display: grid;
          gap: 10px;
        }
        .field-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px 12px;
        }
        .field {
          display: flex;
          flex-direction: column;
          min-height: 44px;
          padding: 8px 10px;
          border: 1px dashed #111;
          border-radius: 8px;
        }
        .label {
          font-size: 10px;
          opacity: 0.7;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .value {
          font-weight: 900;
        }
        .iata-mini {
          font-style: normal;
          font-weight: 900;
          margin-left: 6px;
          letter-spacing: 0.6px;
        }

        .ticket-stub {
          border-left: 1.5px dashed #111;
          padding: 10px;
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          gap: 8px;
        }
        .stub-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed #111;
          padding-bottom: 6px;
          margin-bottom: 2px;
        }
        .airline-mini {
          font-weight: 800;
          font-size: 12px;
        }
        .class-mini {
          font-size: 11px;
          opacity: 0.8;
          font-weight: 700;
        }
        .stub-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .stub-grid .field {
          padding: 6px 8px;
          min-height: 40px;
        }
        .stub-grid span {
          font-size: 10px;
          opacity: 0.7;
        }
        .stub-grid b {
          font-weight: 800;
        }
        .barcode-v {
          margin-top: auto;
          height: 38px;
          background: repeating-linear-gradient(
            90deg,
            #111 0 2px,
            transparent 2px 4px
          );
          border-radius: 3px;
        }
        .stub-flight {
          text-align: center;
          font: 900 14px ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 0.6px;
          opacity: 0.85;
        }

        @media (max-width: 640px) {
          .ticket {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }
          .ticket-stub {
            border-left: none;
            border-top: 1.5px dashed #111;
            grid-template-rows: auto auto auto;
          }
          .field-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Pass-only view once torn */
        .pass-only {
          max-width: 720px;
          margin: 0 auto;
          background: #fff;
          color: #111827;
          border: 1px solid #111;
          border-radius: 14px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
          padding: 14px;
          animation: passReveal 0.36s ease-out both;
        }
        @keyframes passReveal {
          from {
            transform: translateY(-8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .pass-only .actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .cell {
          flex: 1;
          border: 1px dashed #111;
          border-radius: 8px;
          padding: 8px;
          display: flex;
          flex-direction: column;
        }
        .cell span {
          font-size: 11px;
          opacity: 0.7;
        }

        /* Titles */
        .tb-head {
          max-width: 720px;
          margin: 0 auto 16px;
          text-align: center;
        }
        .tb-title {
          color: #111827;
          line-height: 1.2;
          margin: 0 0 6px;
          letter-spacing: 0.2px;
          font-size: 58px;
          font-weight: 900;
          letter-spacing: 0.3px;
        }
        .tb-sub {
          color: #4b5563;
          font-size: 14px;
          margin: 0;
        }
        @media (min-width: 768px) {
          .tb-sub {
            font-size: 20px;
          }
        }

        /* Distinct roles on receipt lines */
        .line {
          position: relative;
          display: grid;
          grid-template-columns: 64px 1fr;
          align-items: start;
          gap: 10px;
          border-bottom: 1px dashed #111;
          padding: 8px 0;
        }
        .line .meta {
          font: 700 11px ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 0.3px;
          opacity: 0.7;
        }
        .line.bot .meta {
          color: #0f172a;
        } /* dark */
        .line.user .meta {
          color: #334155;
        } /* slate */

        .line .text {
          line-height: 1.35;
        }
        .line.user .text {
          font-weight: 700;
        }

        /* Slight receipt chip behind user lines for contrast */
        .line.user::after {
          content: "";
          position: absolute;
          left: 60px;
          right: 0;
          top: 2px;
          bottom: 2px;
          background: repeating-linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.03) 0 20px,
            rgba(0, 0, 0, 0.05) 20px 21px
          );
          border-left: 1px dotted #111;
          opacity: 0.45;
          pointer-events: none;
          border-radius: 6px;
        }

        /* Print-in animation for new rows and active blocks */
        @keyframes printRow {
          from {
            transform: translateY(-6px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        [data-print] {
          animation: printRow 0.28s ease-out both;
        }
        .block {
          animation: printRow 0.28s ease-out both;
        }

        /* A tiny “paper mouth” at the top for vibe */
        .paper::before {
          content: "";
          display: block;
          height: 6px;
          margin: -2px -2px 8px -2px;
          background: linear-gradient(90deg, #111 8px, transparent 8px) 0 0/16px
            100% no-repeat;
          opacity: 0.25;
        }

        /* Print-in animation for each new chat row */
        @keyframes printLine {
          from {
            transform: translateY(-6px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        [data-print] {
          animation: printLine 0.26s ease-out both;
        }

        /* Paper reveal for freshly mounted blocks */
        @keyframes paperReveal {
          from {
            clip-path: inset(0 0 100% 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }
        .print-reveal {
          animation: paperReveal 0.34s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          will-change: clip-path, transform;
        }

        /* Respect user preference */
        @media (prefers-reduced-motion: reduce) {
          [data-print],
          .print-reveal {
            animation: none !important;
          }
        }

        @media (max-width: 768px) {
          .receipt {
            margin: 0 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default TripBuilderReceipt;
