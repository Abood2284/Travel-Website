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
import BoardingPass from "./BoardingPass";

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
  | "travellers"
  | "passengerName"
  | "nationality"
  | "airline"
  | "hotel"
  | "flightClass"
  | "visa"
  | "summary";

const STEP_FLOW: StepId[] = [
  "fromLocation",
  "destinationSeed",
  "destinationSelect",
  "dates",
  "travellers",
  "passengerName",
  "nationality",
  "airline",
  "hotel",
  "flightClass",
  "visa",
  "summary",
];

const STEP_TITLES: Record<StepId, string> = {
  fromLocation: "Departure City",
  destinationSeed: "Destination Check",
  destinationSelect: "Choose Destination",
  dates: "Travel Dates",
  travellers: "Travellers",
  passengerName: "Lead Passenger",
  nationality: "Nationality",
  airline: "Airline Preference",
  hotel: "Hotel Preference",
  flightClass: "Cabin Class",
  visa: "Visa Status",
  summary: "Trip Summary",
};

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
const AIRLINE_CODE: Record<string, string> = {
  Any: "—",
  IndiGo: "6E",
  "Air India": "AI",
  Emirates: "EK",
  "Qatar Airways": "QR",
  Vistara: "UK",
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
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * NOTE: Boarding pass has limited space. Render passenger name as
 * "FirstName X." while preserving the full name in state/payload.
 * Only the visual BoardingPass uses this trimmed form.
 */
function formatPassengerNameForPass(fullName?: string): string {
  const name = (fullName || "").trim();
  if (!name) return "GUEST";
  const firstSpace = name.indexOf(" ");
  if (firstSpace < 0) return name;
  const first = name.slice(0, firstSpace);
  // find first non-space character after the first space
  let i = firstSpace + 1;
  while (i < name.length && name[i] === " ") i++;
  const initial = i < name.length ? name[i].toUpperCase() : "";
  if (!initial) return first;
  return `${first} ${initial}.`;
}

function backOne(dispatch: React.Dispatch<Action>, state: State) {
  const i = STEP_FLOW.indexOf(state.step);
  if (i <= 0) return; // nothing to go back to
  const prev = STEP_FLOW[i - 1];
  dispatch({ type: "GOTO", step: prev });
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
  // fade between questions
  const [isFading, setIsFading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const TEAR_MS = 700; // keep in sync with CSS animation
  // stable seed for boarding-pass meta
  const passSeedRef = useRef(rid());
  // animation refs
  const receiptRef = useRef<HTMLDivElement>(null);
  const passRef = useRef<HTMLDivElement>(null);

  // play on new chat line
  useEffect(() => {
    if (state.chat.length > prevLenRef.current) {
      play("print");
      prevLenRef.current = state.chat.length;
    } else {
      prevLenRef.current = state.chat.length;
    }
  }, [state.chat.length, play]);

  // when entering summary, ding and animate pass in
  useEffect(() => {
    if (state.step === "summary") {
      play("ding");
      // Animate BoardingPass fade-in using GSAP if available, else CSS fallback
      const el = passRef.current;
      if (!el) return;
      // initialize start state for graceful fallback
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      (async () => {
        try {
          const gsapMod = await import("gsap");
          const gsap = gsapMod.gsap || gsapMod.default || gsapMod;
          gsap.to(el, { opacity: 1, y: 0, duration: 0.36, ease: "power2.out" });
        } catch {
          // fallback
          el.style.transition =
            "opacity 240ms ease-out, transform 240ms ease-out";
          requestAnimationFrame(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          });
        }
      })();
    }
  }, [state.step, play]);

  // Re-collapse transcript on each step change when compact mode is enabled
  useEffect(() => {
    if (compactTranscript) setShowAll(false);
  }, [state.step, compactTranscript]);

  // Auto-derive days/nights when both dates are provided
  useEffect(() => {
    if (state.startDate && state.endDate) {
      dispatch({ type: "DERIVE_FROM_DATES" });
    }
  }, [state.startDate, state.endDate]);

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

  // Smoothly transition between steps (Typeform-like)
  function goto(step: StepId) {
    // Special transition: when going to summary, fade the receipt out using GSAP, then reveal pass
    if (step === "summary" && !state.reducedMotion) {
      const el = receiptRef.current;
      if (el) {
        (async () => {
          try {
            const gsapMod = await import("gsap");
            const gsap = gsapMod.gsap || gsapMod.default || gsapMod;
            await gsap.to(el, {
              opacity: 0,
              y: -8,
              duration: 0.28,
              ease: "power2.inOut",
            });
          } catch {
            el.style.transition =
              "opacity 200ms ease-in, transform 200ms ease-in";
            el.style.opacity = "0";
            el.style.transform = "translateY(-8px)";
            await new Promise((r) => setTimeout(r, 200));
          }
          dispatch({ type: "GOTO", step: "summary" });
        })();
        return;
      }
    }
    if (state.reducedMotion) {
      dispatch({ type: "GOTO", step });
      return;
    }
    if (isFading) return;
    setIsFading(true);
    // keep in sync with .fading-out animation duration
    setTimeout(() => {
      dispatch({ type: "GOTO", step });
      setIsFading(false);
      setIsEntering(true);
      // keep in sync with .fading-in animation duration
      setTimeout(() => setIsEntering(false), 240);
    }, 200);
  }

  // Visual confirm on option click, then run next
  function confirmThen(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    next: () => void
  ) {
    const btn = e.currentTarget;
    if (!btn) {
      next();
      return;
    }
    if (state.reducedMotion) {
      next();
      return;
    }
    btn.classList.add("confirming");
    setTimeout(() => {
      btn.classList.remove("confirming");
      next();
    }, 1200);
  }

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
    } else if (state.step === "travellers") {
      pushBot("How many people are planning to travel?");
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
      goto("dates");
      return;
    }
    if (choice === "where") {
      pushUser("Where is that?");
      if (state.destination) pushBot(whereIs(state.destination));
      // stay on step; give follow-up choice
      return;
    }
    pushUser("Change destination");
    goto("destinationSelect");
  }

  function selectDestination(dest: string) {
    pushUser(dest);
    dispatch({ type: "SET_FIELD", key: "destination", value: dest });
    pushBot(`Nice. ${dest} it is.`);
    pushBot(niceFact(dest));
    goto("dates");
  }

  function datesPreset(choice: "nextWeekend" | "within30" | "pick") {
    if (choice === "pick") return; // picker UI below
    const { start, end } =
      choice === "nextWeekend" ? nextWeekend() : within30Days();
    dispatch({ type: "SET_FIELD", key: "startDate", value: start });
    dispatch({ type: "SET_FIELD", key: "endDate", value: end });
    dispatch({ type: "DERIVE_FROM_DATES" });
    pushUser(choice === "nextWeekend" ? "Next weekend" : "Within 30 days");
    goto("travellers");
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
    goto("passengerName");
  }

  function nationalitySelect(n: string) {
    pushUser(n);
    dispatch({ type: "SET_FIELD", key: "nationality", value: n });
    goto("airline");
  }

  function airlineSelect(a: string) {
    pushUser(a);
    dispatch({ type: "SET_FIELD", key: "airlinePref", value: a });
    goto("hotel");
  }

  function selectFromLocation(from: string) {
    pushUser(from);
    dispatch({ type: "SET_FIELD", key: "from", value: from });
    goto("destinationSelect");
  }

  function selectPassengerName(name: string) {
    pushUser(name);
    dispatch({ type: "SET_FIELD", key: "passengerName", value: name });
    goto("nationality");
  }

  function selectHotel(hotel: string) {
    pushUser(hotel);
    dispatch({ type: "SET_FIELD", key: "hotelPref", value: hotel });
    goto("flightClass");
  }

  function selectFlightClass(flightClass: string) {
    pushUser(flightClass);
    dispatch({ type: "SET_FIELD", key: "flightClass", value: flightClass });
    goto("visa");
  }

  function selectVisa(visa: string) {
    pushUser(visa);
    dispatch({ type: "SET_FIELD", key: "visaStatus", value: visa });
    goto("summary");
  }

  function toSummary() {
    goto("summary");
  }

  // Footer navigation helpers
  function nextOne() {
    const i = STEP_FLOW.indexOf(state.step);
    if (i < 0 || i >= STEP_FLOW.length - 1) return;
    const next = STEP_FLOW[i + 1];
    goto(next);
  }

  const canGoBack = (() => {
    return STEP_FLOW.indexOf(state.step) > 0;
  })();

  const canGoNext = (() => {
    switch (state.step) {
      case "fromLocation":
        return !!state.from;
      case "destinationSeed":
        return true;
      case "destinationSelect":
        return !!state.destination;
      case "dates":
        return !!(state.startDate && state.endDate);
      case "travellers": {
        const adultsCount = typeof state.adults === "number" ? state.adults : 0;
        const childrenCount = typeof state.kids === "number" ? state.kids : 0;
        const isValid = adultsCount >= 1 && childrenCount >= 0;
        return isValid;
      }
      case "passengerName":
        return !!state.passengerName;
      case "nationality":
        return !!state.nationality;
      case "airline":
        return !!state.airlinePref;
      case "hotel":
        return !!state.hotelPref;
      case "flightClass":
        return !!state.flightClass;
      case "visa":
        return !!state.visaStatus;
      case "summary":
        return false;
      default:
        return false;
    }
  })();

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
  // Strict one-at-a-time question mode (Typeform-like)
  const oneAtATime = true;
  // Date guardrail: startDate must be <= endDate
  const isDateRangeInvalid = !!(
    state.startDate &&
    state.endDate &&
    new Date(state.startDate) > new Date(state.endDate)
  );

  // Travellers validation
  const adultsCount = typeof state.adults === "number" ? state.adults : 0;
  const childrenCount = typeof state.kids === "number" ? state.kids : 0;
  const isTravellersValid = adultsCount >= 1 && childrenCount >= 0;
  const travellersError = (() => {
    if (adultsCount < 1 && childrenCount >= 1)
      return "Children cannot travel without an adult";
    if (adultsCount < 1) return "At least 1 adult is required";
    return "";
  })();

  const totalSteps = STEP_FLOW.length;
  const activeStepIndex = Math.max(0, STEP_FLOW.indexOf(state.step));
  const stepCountLabel =
    totalSteps > 0
      ? `Step ${Math.min(activeStepIndex + 1, totalSteps)} of ${totalSteps}`
      : "";
  const stepTitleLabel = STEP_TITLES[state.step] || "";
  const StepIntro = () =>
    stepCountLabel ? (
      <div className="step-label" role="text">
        <span className="step-label__count">{stepCountLabel}</span>
        {stepTitleLabel ? (
          <>
            <span className="step-label__divider" aria-hidden>
              •
            </span>
            <span className="step-label__title">{stepTitleLabel}</span>
          </>
        ) : null}
      </div>
    ) : null;

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className={className}>
      {/* When torn: show pass-only view and exit early */}
      {isTorn && (
        <div className="pass-only">
          <BoardingPass
            fromCity={state.from || originLabel || "Your City"}
            toCity={state.destination || "—"}
            iataFrom={iataFor(state.from || originLabel || "Your City")}
            iataTo={iataFor(state.destination || "—")}
            departDate={state.startDate}
            arriveDate={state.endDate}
            passengerName={formatPassengerNameForPass(
              state.passengerName || passengerName || "GUEST"
            )}
            visaStatus={state.visaStatus || "N/A"}
            adults={state.adults || 1}
            children={state.kids || 0}
            airline={state.airlinePref || "—"}
            nationality={state.nationality || "—"}
            hotelPref={state.hotelPref || "3 Star"}
            flightClass={state.flightClass || "Economy"}
          />
          <div className="actions">
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

          {state.step === "summary" ? (
            <div ref={passRef}>
              <StepIntro />
              <BoardingPass
                fromCity={state.from || originLabel || "Your City"}
                toCity={state.destination || "—"}
                iataFrom={iataFor(state.from || originLabel || "Your City")}
                iataTo={iataFor(state.destination || "—")}
                departDate={state.startDate}
                arriveDate={state.endDate}
                passengerName={formatPassengerNameForPass(
                  state.passengerName || passengerName || "GUEST"
                )}
                visaStatus={state.visaStatus || "N/A"}
                adults={state.adults || 1}
                children={state.kids || 0}
                airline={state.airlinePref || "—"}
                nationality={state.nationality || "—"}
                hotelPref={state.hotelPref || "3 Star"}
                flightClass={state.flightClass || "Economy"}
              />
            </div>
          ) : (
            <div
              ref={receiptRef}
              className={`receipt${isTearing ? " tearing" : ""}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  const target = e.target as HTMLElement | null;
                  const tag = (target?.tagName || "").toLowerCase();
                  const isEditable =
                    tag === "input" ||
                    tag === "textarea" ||
                    target?.isContentEditable;
                  if (isEditable) return; // let inputs handle backspace
                  e.preventDefault();
                  backOne(dispatch, state);
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
                className={`paper${
                  compactTranscript || oneAtATime ? " no-scroll" : ""
                }`}
                role="log"
                aria-live="polite"
              >
                {!oneAtATime && chatHiddenCount > 0 && (
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
                {!oneAtATime && (
                  <>
                    {chatToShow.map((m) => (
                      <div key={m.id} className={`line ${m.role}`} data-print>
                        <span className="meta">
                          {m.role === "bot" ? "BOT" : "YOU"}
                        </span>
                        <span className="text">{m.text}</span>
                      </div>
                    ))}
                  </>
                )}
                {!oneAtATime &&
                  compactTranscript &&
                  showAll &&
                  state.chat.length > maxLines && (
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
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">Where are you traveling from?</div>
                    <div className="mobile-only">
                      <label className="date-col">
                        <span className="date-label">Origin</span>
                        <select
                          className="select"
                          defaultValue=""
                          onChange={(e) =>
                            e.target.value && selectFromLocation(e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select your traveling point
                          </option>
                          {ORIGIN_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="opts desktop-only">
                      {ORIGIN_CITIES.map((city) => (
                        <button
                          key={city}
                          className="opt"
                          onClick={(e) =>
                            confirmThen(e, () => selectFromLocation(city))
                          }
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state.step === "destinationSeed" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">
                      Want to keep {state.destination} as your destination?
                    </div>
                    <div className="opts">
                      <button
                        className="opt"
                        onClick={(e) =>
                          confirmThen(e, () => nextFromDestinationSeed("keep"))
                        }
                      >
                        Keep {state.destination}
                      </button>

                      <button
                        className="opt"
                        onClick={(e) =>
                          confirmThen(e, () =>
                            nextFromDestinationSeed("change")
                          )
                        }
                      >
                        Please, Select your destination
                      </button>
                    </div>
                  </div>
                )}

                {state.step === "destinationSelect" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">Please, Pick a destination</div>
                    <div className="mobile-only">
                      <label className="date-col">
                        <span className="date-label">Destination</span>
                        <select
                          className="select"
                          defaultValue=""
                          onChange={(e) =>
                            e.target.value && selectDestination(e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select a destination
                          </option>
                          {DESTINATIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="opts desktop-only">
                      {DESTINATIONS.map((d) => (
                        <button
                          key={d}
                          className="opt"
                          onClick={(e) =>
                            confirmThen(e, () => selectDestination(d))
                          }
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state.step === "dates" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">When do you plan to travel?</div>
                    <div className="date-grid">
                      <label className="date-col">
                        <span className="date-label">Start date</span>
                        <input
                          type="date"
                          value={state.startDate || ""}
                          max={state.endDate || ""}
                          className={isDateRangeInvalid ? "invalid" : undefined}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            dispatch({
                              type: "SET_FIELD",
                              key: "startDate",
                              value: newStart,
                            });
                            // Guardrail: start date cannot be after end date
                            if (
                              state.endDate &&
                              new Date(state.endDate) < new Date(newStart)
                            ) {
                              dispatch({
                                type: "SET_FIELD",
                                key: "endDate",
                                value: newStart,
                              });
                            }
                          }}
                        />
                      </label>
                      <label className="date-col">
                        <span className="date-label">End date</span>
                        <input
                          type="date"
                          value={state.endDate || ""}
                          min={state.startDate || ""}
                          className={isDateRangeInvalid ? "invalid" : undefined}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_FIELD",
                              key: "endDate",
                              value: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    {state.startDate && state.endDate && (
                      <div
                        className="continue-wrap"
                        role="group"
                        aria-label="Confirm dates"
                      >
                        <button
                          className="cta continue"
                          onClick={() => goto("travellers")}
                          disabled={isDateRangeInvalid}
                        >
                          OK
                        </button>
                        {isDateRangeInvalid && (
                          <div className="error" role="alert">
                            Start date cannot be after end date
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {state.step === "travellers" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">
                      How many travelers are joining this trip?
                    </div>
                    <div className="field-col">
                      <label className="field-row">
                        <span className="text-lg">Adults</span>
                        <div className="inline">
                          <button
                            className="opt"
                            onClick={() =>
                              dispatch({
                                type: "SET_FIELD",
                                key: "adults",
                                value: Math.max(0, (state.adults ?? 0) - 1),
                              })
                            }
                            aria-label="Decrease adults"
                          >
                            −
                          </button>
                          <b className="value">{state.adults ?? 0}</b>
                          <button
                            className="opt"
                            onClick={() =>
                              dispatch({
                                type: "SET_FIELD",
                                key: "adults",
                                value: Math.max(0, (state.adults ?? 0) + 1),
                              })
                            }
                            aria-label="Increase adults"
                          >
                            +
                          </button>
                        </div>
                      </label>
                      <label className="field-row">
                        <span className="text-lg">Children</span>
                        <div className="inline">
                          <button
                            className="opt"
                            onClick={() =>
                              dispatch({
                                type: "SET_FIELD",
                                key: "kids",
                                value: Math.max(0, (state.kids ?? 0) - 1),
                              })
                            }
                            aria-label="Decrease children"
                          >
                            −
                          </button>
                          <b className="value">{state.kids ?? 0}</b>
                          <button
                            className="opt"
                            onClick={() =>
                              dispatch({
                                type: "SET_FIELD",
                                key: "kids",
                                value: Math.max(0, (state.kids ?? 0) + 1),
                              })
                            }
                            aria-label="Increase children"
                          >
                            +
                          </button>
                        </div>
                      </label>
                      <div className="field-actions">
                        <button
                          className="cta continue"
                          onClick={() => goto("passengerName")}
                          disabled={!isTravellersValid}
                        >
                          OK
                        </button>
                        {!isTravellersValid && (
                          <div className="error" role="alert">
                            {travellersError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {state.step === "passengerName" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">Great! what's your name, _ _ ?</div>
                    <div className="field-col mobile-stack">
                      <label className="field-row">
                        <span className="text-lg">Name</span>
                        <input
                          type="text"
                          placeholder="Type your answer"
                          className="field-input"
                          value={state.passengerName || ""}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_FIELD",
                              key: "passengerName",
                              value: e.target.value,
                            })
                          }
                        />
                      </label>
                      <div className="field-actions">
                        <button
                          className="cta"
                          onClick={() => goto("nationality")}
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {state.step === "nationality" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">What is your nationality?</div>
                    <div className="opts">
                      {NATIONALITIES.map((n) => (
                        <button
                          key={n}
                          className="opt"
                          onClick={(e) =>
                            confirmThen(e, () => nationalitySelect(n))
                          }
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state.step === "airline" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">Any airline preference?</div>
                    <div className="opts">
                      {AIRLINES.map((a) => (
                        <button
                          key={a}
                          className="opt"
                          onClick={(e) =>
                            confirmThen(e, () => airlineSelect(a))
                          }
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state.step === "hotel" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">Do you have a hotel preference?</div>
                    <div className="opts hotel-opts">
                      {[...HOTEL_PREFERENCES, "7 Star"].map((h) => (
                        <button
                          key={h}
                          className="opt"
                          onClick={(e) => confirmThen(e, () => selectHotel(h))}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state.step === "flightClass" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">
                      Amazing! Do you have a Flight's class preference?
                    </div>
                    <div className="opts">
                      {[...FLIGHT_CLASSES, "Premium Economy"].map((c) => (
                        <button
                          key={c}
                          className="opt"
                          onClick={(e) =>
                            confirmThen(e, () => selectFlightClass(c))
                          }
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state.step === "visa" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q"> Finally, Do you have a visa?</div>
                    <div className="opts">
                      {VISA_STATUS.map((v) => (
                        <button
                          key={v}
                          className="opt"
                          onClick={(e) => confirmThen(e, () => selectVisa(v))}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fixed footer navigation (inside paper) */}
                <nav className="footer-nav" aria-label="Question navigation">
                  {state.step === "dates" &&
                    state.startDate &&
                    state.endDate && (
                      <button
                        className="nav-btn nav-continue"
                        onClick={() => goto("travellers")}
                        aria-label="Confirm dates"
                        disabled={isDateRangeInvalid}
                      >
                        ✓
                      </button>
                    )}
                  <button
                    className="nav-btn nav-next"
                    aria-label="Navigate to next question"
                    onClick={nextOne}
                    disabled={!canGoNext}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M3.293 8.293a1 1 0 0 1 1.414 0L12 15.586l7.293-7.293a1 1 0 1 1 1.414 1.414L13.414 17a2 2 0 0 1-2.828 0L3.293 9.707a1 1 0 0 1 0-1.414Z"></path>
                    </svg>
                  </button>
                  <div className="nav-divider" aria-hidden />
                  <button
                    className="nav-btn nav-prev"
                    aria-label="Navigate to previous question"
                    onClick={() => backOne(dispatch, state)}
                    disabled={!canGoBack}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M10.586 7a2 2 0 0 1 2.828 0l7.293 7.293a1 1 0 0 1-1.414 1.414L12 8.414l-7.293 7.293a1 1 0 0 1-1.414-1.414L10.586 7Z"></path>
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .receipt {
          background: #fff;
          color: #111827;
          border: 1px solid #111;
          border-radius: 14px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
          padding: 28px;
          max-width: 1040px; /* widened again by ~20% */
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 80vh; /* fill remaining after header */
          --tb-step-label: clamp(12px, 0.6vw + 10px, 14px);
          --tb-question: clamp(26px, 2.4vw + 18px, 34px);
          --tb-answer: clamp(16px, 1.1vw + 14px, 22px);
          --tb-helper: clamp(12px, 0.4vw + 11px, 16px);
          --tb-meta: clamp(11px, 0.3vw + 9px, 13px);
          --tb-line-height-tight: 1.25;
          --tb-line-height-body: 1.42;
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
          padding: 28px 20px; /* more top padding */
          border-radius: 10px;
          max-height: 82vh;
          min-height: 38vh; /* reduce by ~75% from previous */
          overflow: auto;
          position: relative; /* anchor footer nav inside */
          flex: 1;
          min-height: 0; /* allow flex child to scroll */
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
          padding: 6px 12px;
          font-size: var(--tb-helper);
          text-transform: none;
          letter-spacing: 0.16px;
        }
        .line.faded {
          opacity: 0.75;
        }
        .step-label {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          margin: 0 0 10px;
          color: rgba(17, 24, 39, 0.7);
          font-size: var(--tb-step-label);
          letter-spacing: 0.28px;
          text-transform: uppercase;
        }
        .step-label__count {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 700;
          font-size: var(--tb-step-label);
        }
        .step-label__divider {
          font-weight: 700;
          color: rgba(17, 24, 39, 0.4);
        }
        .step-label__title {
          font-family: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          font-weight: 600;
          font-size: calc(var(--tb-step-label) + 1px);
          letter-spacing: 0.12px;
          text-transform: none;
        }
        .block.print-reveal .step-label {
          animation: printRow 0.28s ease-out both;
          animation-delay: 20ms;
        }
        .block.print-reveal .q {
          animation: printRow 0.32s ease-out both;
          animation-delay: 70ms;
        }
        .block.print-reveal .opts,
        .block.print-reveal .field-col,
        .block.print-reveal .date-grid,
        .block.print-reveal .inline,
        .block.print-reveal .field-actions {
          animation: printRow 0.34s ease-out both;
          animation-delay: 120ms;
        }
        .q {
          font-weight: 900;
          letter-spacing: 0.3px;
          font-size: var(--tb-question);
          line-height: 1.18;
          margin: 12px 0 24px;
        }
        .opts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 12px 0 8px;
        }
        /* Center block container but keep text/components left-aligned */
        .block:not(.summary) {
          margin: 24px auto 32px;
          max-width: 560px;
          text-align: left;
        }
        .block:not(.summary) .q,
        .block:not(.summary) .inline {
          padding-left: 0;
          margin-left: 0;
          margin-right: 0;
          text-align: left;
        }
        .block:not(.summary) .opts {
          padding-left: 0;
          display: grid;
          grid-template-columns: 1fr;
          row-gap: 14px; /* more gap between answers */
          justify-items: start;
        }
        /* Force hotel options to stack one per row on desktop */
        .hotel-opts {
          grid-template-columns: 1fr;
        }
        .block:not(.summary) .opt {
          width: 100%; /* equal widths within row/column grid */
          text-align: left;
          justify-content: flex-start;
          font-size: calc(var(--tb-answer) - 4px);
          line-height: var(--tb-line-height-tight);
          border-radius: 8px; /* less curvy */
          min-height: 40px;
          transition: background-color 120ms ease-out, color 120ms ease-out;
        }
        .block:not(.summary) .opt:hover {
          background: #f3f4f6; /* light gray on hover */
        }
        /* Two-blink confirmation with a gentle hold (faster) */
        @keyframes confirmBlink {
          0% {
            background: #fff;
          }
          15% {
            background: #e5e7eb;
          }
          30% {
            background: #fff;
          }
          55% {
            background: #e5e7eb;
          }
          70% {
            background: #fff;
          }
          100% {
            background: #fff;
          }
        }
        .opt.confirming {
          animation: confirmBlink 1.2s ease-in-out both;
        }
        .opt {
          padding: 8px 12px;
          border: 1px solid #111;
          border-radius: 8px;
          background: #fff;
          color: #111;
          cursor: pointer;
          font-size: calc(var(--tb-answer) - 4px);
          line-height: var(--tb-line-height-tight);
          white-space: nowrap; /* keep button text on a single line */
        }
        .opt[aria-pressed="true"],
        .opt:focus-visible {
          background: #111;
          color: #fff;
          outline: none;
        }
        .inline {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          font-size: calc(var(--tb-answer) - 4px);
        }
        /* Ensure +/- buttons in Travellers are centered and content-width on all viewports */
        .field-row .inline .opt {
          width: auto;
          min-width: 0;
          justify-content: center;
          text-align: center;
        }
        /* Inline +/- controls should size to content, not full width */
        .inline .opt {
          width: auto;
          min-width: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 6px; /* compact control height */
          height: 26px; /* compact height for +/- */
          font-size: 13px; /* smaller glyph size */
        }
        .hint {
          font-size: var(--tb-helper);
          line-height: var(--tb-line-height-body);
          opacity: 0.7;
        }
        .hint.large {
          font-size: calc(
            var(--tb-helper) + 2px
          ); /* larger label for key fields */
        }
        .text-lg {
          font-size: calc(var(--tb-answer) - 2px);
          font-weight: 600;
          line-height: var(--tb-line-height-tight);
        }
        .rowy {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .linkish {
          background: rgba(17, 24, 39, 0.04);
          border: 1px dashed rgba(17, 24, 39, 0.4);
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          color: #1f2937;
          font-size: calc(var(--tb-helper) + 1px);
          letter-spacing: 0.18px;
          text-transform: none;
          transition: background-color 120ms ease-out, color 120ms ease-out,
            border-color 120ms ease-out;
        }
        .linkish:hover,
        .linkish:focus-visible {
          background: rgba(17, 24, 39, 0.08);
          color: #111827;
          border-color: rgba(17, 24, 39, 0.6);
          outline: none;
        }
        .cta {
          background: #111827;
          color: #fff;
          border: 1px solid #111827;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: calc(var(--tb-answer) - 4px);
          font-weight: 600;
          letter-spacing: 0.18px;
          line-height: var(--tb-line-height-tight);
          transition: transform 120ms ease, box-shadow 120ms ease,
            background-color 120ms ease;
        }
        .cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.14);
        }
        .cta:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
        }
        .cta[disabled] {
          background: #e5e7eb;
          color: #9ca3af;
          border-color: #e5e7eb;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        .actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        /* Footer navigation (bottom-right) */
        .footer-nav {
          position: absolute;
          right: 12px;
          bottom: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: saturate(120%) blur(6px);
          border: 1px dashed #111;
          border-radius: 8px;
          padding: 6px;
        }
        .nav-divider {
          width: 1px;
          height: 22px;
          background: #111;
          opacity: 0.25;
        }
        .nav-btn {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #111;
          background: #fff;
          color: #111;
          cursor: pointer;
        }
        .nav-btn svg {
          width: 20px;
          height: 20px;
        }
        .nav-btn[disabled] {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .nav-next {
          background: #111;
          color: #fff;
        }
        .nav-continue {
          background: #16a34a;
          color: #fff;
          border-color: #111;
        }
        .nav-btn svg path {
          fill: currentColor;
        }

        /* Dates UI */
        .date-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 6px;
          margin-bottom: 8px;
        }
        .date-col {
          display: grid;
          gap: 6px;
          text-align: left;
        }
        .date-label {
          font-size: 11px;
          opacity: 0.75;
        }
        .date-col input[type="date"] {
          border: 1px dashed #111; /* receipt-style */
          border-radius: 8px;
          padding: 8px 10px;
          background: #fff;
          color: #111;
          transition: background-color 120ms ease-out, box-shadow 120ms ease-out;
        }
        .date-col input[type="date"].invalid {
          border-color: #ef4444;
          background: #fef2f2;
        }
        .date-col input[type="date"]:hover {
          background: #f9fafb;
        }
        .date-col input[type="date"]:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.18);
        }
        /* Travellers inputs */
        .inline input[type="number"] {
          border: 1px dashed #111; /* receipt-style */
          border-radius: 8px;
          padding: 8px 10px;
          background: #fff;
          color: #111;
          transition: background-color 120ms ease-out, box-shadow 120ms ease-out;
          width: 96px;
        }
        /* Generic field input style with dotted underline */
        .field-input {
          border: none;
          border-bottom: 1px dotted #111;
          border-radius: 0;
          padding: 6px 2px 8px 2px;
          background: transparent;
          width: 100%;
        }
        .field-input:focus {
          outline: none;
          box-shadow: none;
        }
        .field-input::placeholder {
          color: #9ca3af;
          opacity: 1;
          text-overflow: ellipsis;
        }
        @media (max-width: 768px) {
          .field-input::placeholder {
            max-width: 80%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
          }
          /* Mobile: OK button smaller and spaced down a bit */
          .cta.continue {
            font-size: 14px;
            padding: 8px 12px;
            margin-top: 8px;
          }
        }
        .inline input[type="number"]:hover {
          background: #f9fafb;
        }
        .inline input[type="number"]:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.18);
        }
        /* Shared field layout for travellers */
        .field-col {
          display: grid;
          gap: 12px;
        }
        .field-row {
          display: grid;
          grid-template-columns: 100px 1fr;
          align-items: center;
          gap: 10px;
        }
        .field-actions {
          display: flex;
          justify-content: flex-start; /* align left */
          margin-top: 12px; /* add space from previous inline row */
        }
        /* Remove number spinners */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        /* Placeholder-like coloring based on value */
        .muted {
          color: #9ca3af;
        }
        .ink {
          color: #111;
        }
        .continue-wrap {
          display: flex;
          justify-content: flex-start; /* align left */
        }
        .continue {
          margin-top: 4px;
        }
        .error {
          margin-left: 12px;
          align-self: center;
          color: #b91c1c;
          font-size: calc(var(--tb-helper) + 1px);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.12px;
        }
        .error::before {
          content: "⚠";
          font-size: calc(var(--tb-helper) + 2px);
          line-height: 1;
        }
        .block {
          margin: 0;
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

        /* Responsive multi-column options for large lists */
        @media (min-width: 768px) {
          .block:not(.summary) .opts {
            grid-template-columns: repeat(
              2,
              1fr
            ); /* 2 equal columns on tablet */
            column-gap: 16px;
            row-gap: 12px;
          }
          .hotel-opts {
            grid-template-columns: 1fr; /* override to keep single column */
          }
        }
        @media (min-width: 1024px) {
          .block:not(.summary) .opts {
            grid-template-columns: repeat(
              3,
              1fr
            ); /* 3 equal columns on desktop */
          }
          .hotel-opts {
            grid-template-columns: 1fr; /* single column on desktop too */
          }
        }

        /* Pass-only view once torn */
        .pass-only {
          max-width: 1040px;
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
          max-width: 1040px;
          margin: 0 auto 16px;
          text-align: center;
          min-height: 20vh; /* allocate ~20% of viewport */
          display: grid;
          align-content: center;
        }
        .tb-title {
          color: #111827;
          line-height: 1.15;
          margin: 0 0 10px;
          letter-spacing: 0.2px;
          font-size: 90px;
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
          grid-template-columns: 60px 1fr;
          align-items: start;
          gap: 10px;
          border-bottom: 1px dashed #111;
          padding: 10px 0;
        }
        .line .meta {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 700;
          font-size: var(--tb-meta);
          letter-spacing: 0.3px;
          line-height: var(--tb-line-height-tight);
          opacity: 0.85;
          padding: 4px 8px;
          border-radius: 6px;
          align-self: center;
          justify-self: start;
        }
        .line.bot .meta {
          color: #0f172a;
          background: rgba(15, 23, 42, 0.08);
        } /* dark */
        .line.user .meta {
          color: #1e3a8a;
          background: rgba(37, 99, 235, 0.12);
        } /* slate */

        .line .text {
          font-size: calc(var(--tb-answer) - 2px);
          line-height: var(--tb-line-height-body);
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
          background: linear-gradient(
            180deg,
            rgba(59, 130, 246, 0.1),
            rgba(59, 130, 246, 0.04)
          );
          border-left: 2px solid rgba(37, 99, 235, 0.6);
          opacity: 1;
          pointer-events: none;
          border-radius: 8px;
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

        /* Fade out current block before switching to next */
        .fading-out {
          animation: fadeOut 0.2s ease-in forwards;
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-6px);
          }
        }

        /* Fade in the next question */
        .fading-in {
          animation: fadeIn 0.24s ease-out both;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          .print-reveal,
          .block.print-reveal .step-label,
          .block.print-reveal .q,
          .block.print-reveal .opts,
          .block.print-reveal .field-col,
          .block.print-reveal .date-grid,
          .block.print-reveal .inline,
          .block.print-reveal .field-actions {
            animation: none !important;
          }
        }

        @media (max-width: 768px) {
          .receipt {
            margin: 0 12px; /* side padding */
            padding: 16px;
            width: calc(100% - 24px);
            height: auto; /* content-based height on mobile */
            padding-bottom: 24px; /* extra breathing room below */
          }
          /* Center align +/- buttons in Travellers section on mobile */
          .block:not(.summary) .inline .opt {
            justify-content: center;
            text-align: center;
          }
          .tb-title {
            font-size: 48px;
          }
          .paper {
            max-height: initial; /* allow content to define height */
            overflow: visible; /* show full content without internal scroll */
            padding-bottom: 96px; /* account for footer nav height so it doesn't overlap content */
          }
          /* Stack Name label above input on mobile */
          .mobile-stack .field-row {
            grid-template-columns: 1fr;
            align-items: start;
            row-gap: 8px;
          }
          .mobile-stack .field-row .field-input {
            margin-top: 4px;
          }
          .block:not(.summary) {
            max-width: 100%;
          }
          .block:not(.summary) .q,
          .block:not(.summary) .opts,
          .block:not(.summary) .inline {
            padding-left: 0;
            margin-left: 0;
            margin-right: 0;
            text-align: left;
          }
          .block:not(.summary) .opts {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        /* Mobile visibility helpers */
        .mobile-only {
          display: none;
        }
        .desktop-only {
          display: block;
        }
        @media (max-width: 768px) {
          .mobile-only {
            display: block;
          }
          .desktop-only {
            display: none;
          }
          .opts.desktop-only {
            display: none !important;
          }
        }
        /* Mobile select styling */
        .select {
          border: 1px dashed #111;
          border-radius: 8px;
          padding: 10px 12px;
          background: #fff;
          color: #111;
        }
      `}</style>
    </div>
  );
};

export default TripBuilderReceipt;
