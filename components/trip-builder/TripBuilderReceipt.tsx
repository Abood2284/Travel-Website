// component/trip-builder/TripBuilderReceipt.tsx
"use client";
import { daysInclusive, rid, within30Days } from "@/lib/trip-builder/core";
import { nextWeekend } from "@/lib/trip-builder/core";
import {
  AIRLINES,
  DESTINATIONS as DESTINATION_CHOICES,
  NATIONALITIES,
  ORIGIN_CITIES,
  HOTEL_PREFERENCES,
  FLIGHT_CLASSES,
  VISA_STATUS,
  niceFact,
  whereIs,
} from "@/lib/trip-builder/guardrails";
import { DESTINATIONS as DESTINATION_META } from "@/lib/const";
import { TripPayload, TripSeed } from "@/lib/trip-builder/types";
import { useSound } from "@/sfx/SoundProvider";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "./useMedia";
import { useEnterAdvance } from "./useEnterAdvance";
import FlightLoader from "./FlightLoader";

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
  | "phoneNumber"
  | "email"
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
  "phoneNumber",
  "email",
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
  phoneNumber: "Phone Number",
  email: "Email",
  nationality: "Nationality",
  airline: "Airline Preference",
  hotel: "Hotel Preference",
  flightClass: "Cabin Class",
  visa: "Visa Status",
  summary: "Trip Summary",
};

const DEBUG_PREFILL_ENABLED = process.env.NODE_ENV !== "production";

const DESTINATION_LABEL_TO_ID = DESTINATION_META.reduce<Record<string, string>>(
  (acc, dest) => {
    const fullLabel = `${dest.name}, ${dest.country}`.toLowerCase();
    acc[fullLabel] = dest.id;
    acc[dest.name.toLowerCase()] = dest.id;
    return acc;
  },
  {}
);

function destinationSlugFromLabel(label?: string) {
  if (!label) return undefined;
  const key = label.toLowerCase().trim();
  if (DESTINATION_LABEL_TO_ID[key]) return DESTINATION_LABEL_TO_ID[key];
  const [city, country] = label.split(",").map((part) => part.trim());
  if (city && country) {
    const recomposedKey = `${city.toLowerCase()}, ${country.toLowerCase()}`;
    return DESTINATION_LABEL_TO_ID[recomposedKey];
  }
  return undefined;
}

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
  phoneCountryCode?: string;
  phoneNumber?: string;
  email?: string;
  reducedMotion: boolean;
  seededDestination?: string;
  seedPromptShown: boolean;
};

const initialState: State = {
  step: "fromLocation",
  chat: [],
  reducedMotion: false,
  seededDestination: undefined,
  seedPromptShown: false,
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
      s.seededDestination = seed.destination ?? undefined;
      s.seedPromptShown = false;
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
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const router = useRouter();
  const prevLenRef = useRef(0);
  // tear-off ui
  const [isTearing, setIsTearing] = useState(false);
  const [isTorn, setIsTorn] = useState(false);
  // fade between questions
  const [isFading, setIsFading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [submissionState, setSubmissionState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const savingToastIdRef = useRef<string | number | null>(null);
  const TEAR_MS = 700; // keep in sync with CSS animation
  // animation refs
  const receiptRef = useRef<HTMLDivElement>(null);

  const hasAllRequiredFields = Boolean(
    state.from &&
      state.destination &&
      state.nationality &&
      state.startDate &&
      state.endDate &&
      state.passengerName?.trim() &&
      state.email?.trim() &&
      state.phoneCountryCode?.trim() &&
      state.phoneNumber?.trim() &&
      state.airlinePref &&
      state.hotelPref &&
      state.flightClass &&
      state.visaStatus
  );

  // Actions
  const handleSubmit = useCallback(async () => {
    if (!hasAllRequiredFields) return;
    if (submissionState === "saving") return;

    const payload: TripPayload = {
      from: state.from || originLabel || "",
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
      passengerName: state.passengerName || passengerName || "GUEST",
      phoneCountryCode: state.phoneCountryCode || "",
      phoneNumber: state.phoneNumber || "",
      email: state.email || "",
      createdAt: new Date().toISOString(),
    };

    const requestBody = {
      origin: payload.from,
      destination: payload.destination,
      nationality: payload.nationality,
      startDate: payload.startDate,
      endDate: payload.endDate,
      adults: payload.adults,
      kids: payload.kids,
      airlinePreference: payload.airlinePref,
      hotelPreference: payload.hotelPref,
      flightClass: payload.flightClass,
      visaStatus: payload.visaStatus,
      passengerName: payload.passengerName,
      email: payload.email,
      phoneCountryCode: payload.phoneCountryCode,
      phoneNumber: payload.phoneNumber,
    };

    try {
      setSubmissionState("saving");
      console.log("[TripBuilder] Submitting trip request", requestBody);
      const savingToastId = toast.loading("Saving trip request…", {
        duration: Infinity,
      });
      savingToastIdRef.current = savingToastId;
      const response = await fetch("/api/trip-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("[TripBuilder] Trip request response", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("[TripBuilder] Trip request failure body", errorBody);
        throw new Error(`Request failed with status ${response.status}`);
      }

      const responseJson = await response.json().catch(() => null);
      console.log("[TripBuilder] Trip request success payload", responseJson);
      const createdId =
        typeof responseJson === "object" && responseJson !== null
          ? (responseJson as { id?: string }).id ?? null
          : null;
      if (savingToastIdRef.current != null) {
        toast.dismiss(savingToastIdRef.current);
        savingToastIdRef.current = null;
      }
      toast.success("Request received! Our team will be in touch shortly.");
      setSubmissionState("saved");
      onSubmit?.(payload);
      const redirectParams = new URLSearchParams();
      if (createdId) redirectParams.set("tripRequestId", createdId);
      const destinationSlug = destinationSlugFromLabel(payload.destination);
      if (destinationSlug) redirectParams.set("destinationId", destinationSlug);
      const queryString = redirectParams.toString();
      router.push(`/order-confirmation${queryString ? `?${queryString}` : ""}`);
    } catch (error) {
      console.error("[TripBuilder] Trip request submission failed", error);
      setSubmissionState("error");
      if (savingToastIdRef.current != null) {
        toast.dismiss(savingToastIdRef.current);
        savingToastIdRef.current = null;
      }
      toast.error("We couldn’t save your request. Try again.", {
        action: {
          label: "Retry",
          onClick: () => setSubmissionState("idle"),
        },
      });
    }
  }, [
    hasAllRequiredFields,
    submissionState,
    state.from,
    originLabel,
    state.destination,
    state.nationality,
    state.startDate,
    state.endDate,
    state.days,
    state.adults,
    state.kids,
    state.airlinePref,
    state.hotelPref,
    state.flightClass,
    state.visaStatus,
    state.passengerName,
    passengerName,
    state.phoneCountryCode,
    state.phoneNumber,
    state.email,
    onSubmit,
    router,
  ]);

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

  useEffect(() => {
    if (state.step !== "summary") {
      if (submissionState !== "idle") {
        setSubmissionState("idle");
      }
      return;
    }
    if (submissionState !== "idle") return;
    if (!hasAllRequiredFields) return;
    void handleSubmit();
  }, [
    state.step,
    submissionState,
    hasAllRequiredFields,
    state.from,
    state.destination,
    state.nationality,
    state.startDate,
    state.endDate,
    state.passengerName,
    state.email,
    state.phoneCountryCode,
    state.phoneNumber,
    state.airlinePref,
    state.hotelPref,
    state.flightClass,
    state.visaStatus,
    handleSubmit,
  ]);

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
      phoneCountryCode: state.phoneCountryCode,
      phoneNumber: state.phoneNumber,
      email: state.email,
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

  const prefillForDebug = useCallback(() => {
    if (!DEBUG_PREFILL_ENABLED) return;
    const { start, end } = within30Days();
    dispatch({ type: "RESET" });
    const updates: Array<{ key: keyof State; value: State[keyof State] }> = [
      { key: "from", value: "Mumbai, India" },
      { key: "destination", value: "Dubai, UAE" },
      { key: "startDate", value: start },
      { key: "endDate", value: end },
      { key: "passengerName", value: "Debug Traveller" },
      { key: "adults", value: 2 },
      { key: "kids", value: 0 },
      { key: "phoneCountryCode", value: "+91" },
      { key: "phoneNumber", value: "9876543210" },
      { key: "email", value: "debug@example.com" },
      { key: "nationality", value: "Indian" },
      { key: "airlinePref", value: "Any" },
      { key: "hotelPref", value: "3 Star" },
      { key: "flightClass", value: "Economy" },
    ];
    updates.forEach(({ key, value }) => {
      dispatch({ type: "SET_FIELD", key, value });
    });
    dispatch({ type: "DERIVE_FROM_DATES" });
    dispatch({ type: "GOTO", step: "visa" });
  }, [dispatch]);

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
    } else if (state.step === "phoneNumber") {
      pushBot("What's the best phone number (with country code)?");
    } else if (state.step === "email") {
      pushBot("Where should we email your itinerary?");
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
      if (state.seededDestination) {
        dispatch({
          type: "SET_FIELD",
          key: "seededDestination",
          value: undefined,
        });
      }
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
    dispatch({ type: "SET_FIELD", key: "seededDestination", value: undefined });
    dispatch({ type: "SET_FIELD", key: "seedPromptShown", value: true });
    goto("destinationSelect");
  }

  function selectDestination(dest: string) {
    pushUser(dest);
    dispatch({ type: "SET_FIELD", key: "destination", value: dest });
    dispatch({ type: "SET_FIELD", key: "seededDestination", value: undefined });
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
    if (state.seededDestination) {
      if (!state.seedPromptShown && state.destination) {
        pushBot(
          `Got the route from the globe. Destination: ${state.destination}.`
        );
        dispatch({ type: "SET_FIELD", key: "seedPromptShown", value: true });
      }
      goto("destinationSeed");
    } else {
      goto("destinationSelect");
    }
  }

  function selectPassengerName(name: string) {
    pushUser(name);
    dispatch({ type: "SET_FIELD", key: "passengerName", value: name });
    goto("phoneNumber");
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

  const phoneCountryCodeValue = (state.phoneCountryCode || "").trim();
  const phoneNumberValue = (state.phoneNumber || "").replace(/\s+/g, "");
  const isPhoneValid =
    phoneCountryCodeValue.length >= 1 && phoneNumberValue.length >= 6;
  const emailValue = (state.email || "").trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

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
        return !!state.passengerName?.trim();
      case "phoneNumber":
        return isPhoneValid;
      case "email":
        return isEmailValid;
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

  useEnterAdvance(
    (event) => {
      if (!isDesktop || !canGoNext) return null;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      if (
        target &&
        (tag === "input" ||
          tag === "textarea" ||
          target.isContentEditable ||
          target.getAttribute("role") === "combobox")
      ) {
        return null;
      }
      return () => nextOne();
    },
    isDesktop && canGoNext
  );

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
      {submissionState === "saving" && (
        <FlightLoader fullscreen message="Submitting your trip request…" />
      )}
      {!isTorn && (
        <>
          <div
            className="tb-head"
            role="group"
          aria-label="Trip Builder header"
        >
          <div className="tb-title-row">
            <h2 className="tb-title font-black font-3xl">
              {title ?? "Smart Trip Builder"}
            </h2>
            {DEBUG_PREFILL_ENABLED && (
              <button
                type="button"
                className="tb-debug-btn"
                onClick={prefillForDebug}
              >
                Prefill 13 steps
              </button>
            )}
          </div>
          <p className="tb-sub">
            {subtitle ??
              "Conversational, receipt-style planner. Choose answers and we prep your trip + a boarding pass preview."}
            </p>
          </div>

          {state.step === "summary" ? (
            <div className="flex justify-center">
              <div className="w-full max-w-[620px] space-y-6">
                <StepIntro />
                <div
                  className="rounded-3xl border border-slate-200/80 bg-white/90 p-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-lg"
                  role="status"
                  aria-live="polite"
                >
                  {(submissionState === "idle" || submissionState === "saving") && (
                    <>
                      <FlightLoader className="mx-auto mt-2 h-40 w-40" />
                      <h3 className="mt-6 text-xl font-semibold text-slate-900">
                        Submitting your trip request
                      </h3>
                      <p className="mt-3 text-sm text-slate-600">
                        Please wait while we confirm your request. This only takes a moment.
                      </p>
                    </>
                  )}
                  {submissionState === "saved" && (
                    <>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Redirecting to your confirmation
                      </h3>
                      <p className="mt-3 text-sm text-slate-600">
                        Hang tight—your boarding pass and trip add-ons are loading.
                      </p>
                    </>
                  )}
                  {submissionState === "error" && (
                    <>
                      <h3 className="text-xl font-semibold text-slate-900">
                        We couldn’t submit your request
                      </h3>
                      <p className="mt-3 text-sm text-slate-600">
                        Please check your connection and try again. Your answers are still here.
                      </p>
                      <button
                        className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(15,23,42,0.28)]"
                        onClick={() => setSubmissionState("idle")}
                      >
                        Try again
                      </button>
                    </>
                  )}
                </div>
              </div>
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
                          {DESTINATION_CHOICES.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="opts desktop-only">
                      {DESTINATION_CHOICES.map((d) => (
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
                        className="continue-wrap mt-4 flex items-center gap-4"
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
                        {isDesktop && !isDateRangeInvalid && (
                          <span className="hidden md:inline-flex items-center text-xs font-semibold text-slate-500" aria-hidden>
                            press <span className="ml-1 font-black text-slate-900">Enter</span> ↵
                          </span>
                        )}
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
                      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                        <div className="flex items-center gap-4">
                          <button
                            className="cta continue"
                            onClick={() => goto("passengerName")}
                            disabled={!isTravellersValid}
                          >
                            OK
                          </button>
                          {isDesktop && isTravellersValid && (
                            <span className="hidden md:inline-flex items-center text-xs font-semibold text-slate-500" aria-hidden>
                              press <span className="ml-1 font-black text-slate-900">Enter</span> ↵
                            </span>
                          )}
                        </div>
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
                    <div className="q">Great! What's your full name?</div>
                    <div className="field-col mobile-stack">
                      <label className="field-row single">
                        <input
                          type="text"
                          placeholder="Type your name"
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
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          className="cta"
                          onClick={() => goto("phoneNumber")}
                          disabled={!state.passengerName?.trim()}
                        >
                          OK
                        </button>
                        {isDesktop && (
                          <span className="hidden md:inline-flex items-center text-xs font-semibold text-slate-500" aria-hidden>
                            press <span className="ml-1 font-black text-slate-900">Enter</span> ↵
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {state.step === "phoneNumber" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">
                      What's the best number to reach you?
                    </div>
                    <div className="field-col mobile-stack">
                      <div className="phone-grid">
                        <label className="field-row single">
                          <input
                            type="tel"
                            inputMode="tel"
                            placeholder="+971"
                            className="field-input phone-code"
                            value={state.phoneCountryCode || ""}
                            onChange={(e) =>
                              dispatch({
                                type: "SET_FIELD",
                                key: "phoneCountryCode",
                                value: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="field-row single">
                          <input
                            type="tel"
                            inputMode="tel"
                            placeholder="55 123 4567"
                            className="field-input phone-main"
                            value={state.phoneNumber || ""}
                            onChange={(e) =>
                              dispatch({
                                type: "SET_FIELD",
                                key: "phoneNumber",
                                value: e.target.value,
                              })
                            }
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          className="cta"
                          onClick={() => goto("email")}
                          disabled={!isPhoneValid}
                        >
                          OK
                        </button>
                        {isDesktop && (
                          <span className="hidden md:inline-flex items-center text-xs font-semibold text-slate-500" aria-hidden>
                            press <span className="ml-1 font-black text-slate-900">Enter</span> ↵
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {state.step === "email" && (
                  <div
                    className={`block print-reveal${
                      isFading ? " fading-out" : ""
                    }${isEntering ? " fading-in" : ""}`}
                  >
                    <StepIntro />
                    <div className="q">
                      Where should we email your trip details?
                    </div>
                    <div className="field-col mobile-stack">
                      <label className="field-row single">
                        <input
                          type="email"
                          placeholder="you@example.com"
                          className="field-input"
                          value={state.email || ""}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_FIELD",
                              key: "email",
                              value: e.target.value,
                            })
                          }
                        />
                      </label>
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          className="cta"
                          onClick={() => goto("nationality")}
                          disabled={!isEmailValid}
                        >
                          OK
                        </button>
                        {isDesktop && (
                          <span className="hidden md:inline-flex items-center text-xs font-semibold text-slate-500" aria-hidden>
                            press <span className="ml-1 font-black text-slate-900">Enter</span> ↵
                          </span>
                        )}
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
          max-width: 1180px; /* widened again */
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
        .block.print-reveal .inline {
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
          max-width: 720px;
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
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          row-gap: 14px; /* more gap between answers */
          column-gap: 14px;
          justify-items: stretch;
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
          .phone-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .phone-code {
            text-align: left;
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
        .field-row.single {
          grid-template-columns: 1fr;
        }
        .phone-grid {
          display: grid;
          grid-template-columns: minmax(68px, 96px) 1fr;
          gap: 10px;
          align-items: start;
        }
        .phone-code {
          text-align: center;
          letter-spacing: 0.6px;
        }
        .phone-main {
          text-align: left;
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
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            column-gap: 16px;
            row-gap: 12px;
          }
          .hotel-opts {
            grid-template-columns: minmax(220px, 1fr); /* keep single column */
          }
        }
        @media (min-width: 1024px) {
          .block:not(.summary) .opts {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }
          .hotel-opts {
            grid-template-columns: minmax(
              240px,
              1fr
            ); /* single column on desktop too */
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
        .tb-title-row {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
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
        .tb-debug-btn {
          border: none;
          background: #111827;
          color: #f8fafc;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 9999px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .tb-debug-btn:hover {
          transform: translateY(-1px);
          background: #1f2937;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
        }
        .tb-debug-btn:focus-visible {
          outline: 2px solid #111827;
          outline-offset: 2px;
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
          .block.print-reveal .inline {
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
            grid-template-columns: 1fr;
            row-gap: 12px;
            column-gap: 0;
            justify-items: stretch;
          }
          .step-label {
            font-size: 11px;
            letter-spacing: 0.16px;
          }
          .step-label__count {
            font-size: 11px;
          }
          .step-label__title {
            font-size: 12px;
          }
          .phone-grid {
            grid-template-columns: minmax(64px, 88px) 1fr;
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
