"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type BoardingPassProps = {
  fromCity?: string;
  toCity?: string;
  iataFrom?: string;
  iataTo?: string;
  departDate?: string; // optional, not shown in bottom grid
  arriveDate?: string; // optional, not shown in bottom grid
  passengerName?: string;
  visaStatus?: string; // "Available" | "N/A"
  adults?: number;
  children?: number;
  airline?: string;
  nationality?: string;
  hotelPref?: string;
  flightClass?: string; // Economy | Business | First class
};

export default function BoardingPass(props: BoardingPassProps = {}) {
  function normalizePlaceLabel(label?: string) {
    if (!label) return "";
    const city = String(label).split(",")[0]?.trim();
    if (!city) return label;
    return city;
  }

  function toTitleCase(word: string) {
    if (!word) return "";
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }

  function formatStubFlightClass(label?: string) {
    const raw = label?.trim();
    const value = raw && raw.length > 0 ? raw : "Economy";
    const words = value.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "Economy";
    if (words.length === 2) {
      words[1] = words[1].slice(0, 3);
    }
    return words.map(toTitleCase).join(" ");
  }

  function formatShortDate(d?: string) {
    if (!d) return "—";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    });
  }

  function formatMobileAirline(label?: string) {
    const raw = label?.trim();
    if (!raw) return "—";
    if (raw === "—") return raw;
    const words = raw.split(/\s+/).filter(Boolean);
    if (words.length === 0) return raw;
    if (words.length === 2) {
      words[1] = words[1].slice(0, 3);
    }
    return words.map(toTitleCase).join(" ");
  }

  const name = props.passengerName || "GUEST";
  const visa = props.visaStatus || "N/A";
  const adults = typeof props.adults === "number" ? props.adults : 1;
  const children = typeof props.children === "number" ? props.children : 0;
  const airline = props.airline || "—";
  const nationality = props.nationality || "—";
  const hotel = props.hotelPref || "3 Star";
  const flightClass = (props.flightClass || "ECONOMY").toUpperCase();
  const stubFlightClass = formatStubFlightClass(props.flightClass);
  const mobileAirline = formatMobileAirline(props.airline);
  const mobileStartDate = formatShortDate(props.departDate);
  const mobileEndDate = formatShortDate(props.arriveDate);

  const mobilePassengerValueRef = useRef<HTMLDivElement>(null);
  const mobileClassValueRef = useRef<HTMLDivElement>(null);
  const [mobileValueFontSize, setMobileValueFontSize] = useState<number>();

  const adjustMobileValueFont = useCallback(() => {
    const targets = [
      mobilePassengerValueRef.current,
      mobileClassValueRef.current,
    ].filter(Boolean) as HTMLElement[];
    if (!targets.length) return;

    const MAX_FONT = 18; // align roughly with text-lg
    const MIN_FONT = 12;

    let font = MAX_FONT;
    targets.forEach((el) => {
      el.style.fontSize = `${font}px`;
    });

    let hasOverflow = targets.some((el) => el.scrollWidth > el.clientWidth);
    while (hasOverflow && font > MIN_FONT) {
      font -= 1;
      targets.forEach((el) => {
        el.style.fontSize = `${font}px`;
      });
      hasOverflow = targets.some((el) => el.scrollWidth > el.clientWidth);
    }

    setMobileValueFontSize((current) => (current !== font ? font : current));
  }, []);

  useLayoutEffect(() => {
    adjustMobileValueFont();
  }, [name, flightClass, adjustMobileValueFont]);

  useEffect(() => {
    function handleResize() {
      adjustMobileValueFont();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustMobileValueFont]);

  const FROM = props.iataFrom || "JFK";
  const TO = props.iataTo || "CDG";
  const fromCity = normalizePlaceLabel(props.fromCity) || "NEW YORK";
  const toCity = normalizePlaceLabel(props.toCity) || "PARIS";

  return (
    <div className="w-full flex justify-center p-4 md:p-5">
      <div className="w-full max-w-[900px] mx-auto">
        <div className="relative bg-white rounded-[28px] overflow-hidden shadow-[0_14px_40px_rgba(0,0,0,0.18)] flex md:flex-row flex-col">
          {/* MAIN1 SECTION */}
          <div className="flex-1 min-w-[65%] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-black to-[#222222] text-white px-6 md:px-10 h-[72px] md:h-[96px] flex items-center justify-center">
              <h1 className="w-full text-center text-xl md:text-2xl font-medium tracking-[6px]">
                BOARDING PASS
              </h1>
            </div>

            {/* Flight info */}
            <div className="px-6 md:px-10 py-5 md:py-7 bg-[#f7f7f7] flex-1 flex flex-col">
              {/* Route (fixed: dynamic baseline between codes) */}
              <div className="relative mb-7">
                <div className="pointer-events-none absolute inset-0 z-0">
                  <div
                    className="absolute inset-0 opacity-[0.14] md:opacity-[0.08]"
                    style={{
                      WebkitMaskImage: "url('/images/world.svg')",
                      maskImage: "url('/images/world.svg')",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      backgroundColor: "#000",
                    }}
                  />
                </div>
                {/* Plane watermark (behind text) */}
                <div className="pointer-events-none absolute inset-0 z-0">
                  <div
                    className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[34%] max-w-[420px] h-[92px] opacity-[0.2]"
                    style={{
                      WebkitMaskImage: "url('/images/plane_silhouette.svg')",
                      maskImage: "url('/images/plane_silhouette.svg')",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      backgroundColor: "#000",
                    }}
                  />
                </div>
                {/* Codes row with arrow that fills the gap */}
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6">
                  {/* Left: FROM + IATA */}
                  <div className="relative z-10 pr-2">
                    <div className="text-sm md:text-base text-[#666] mb-1">
                      FROM:
                    </div>
                    <div className="text-[40px] md:text-[52px] font-bold text-black tracking-[2px] leading-none">
                      {FROM}
                    </div>
                  </div>

                  {/* Placeholder keeps center column width so TO/CDG stay aligned */}
                  <div className="relative flex-1 h-[44px] md:h-[60px] opacity-0 pointer-events-none">
                    <div className="relative w-full max-w-[460px] h-full flex items-center justify-center">
                      <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 h-[2px] bg-[#333]" />
                      <span className="absolute right-[8%] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[12px] border-l-[#333] border-y-[8px] border-y-transparent" />
                    </div>
                  </div>

                  {/* Right: TO + IATA */}
                  <div className="relative z-10 pl-2">
                    <div className="text-sm md:text-base text-[#666] mb-1">
                      TO:
                    </div>
                    <div className="text-[40px] md:text-[52px] font-extrabold text-black tracking-[1px] leading-none">
                      {TO}
                    </div>
                  </div>
                </div>

                {/* Secondary info under the codes */}
                <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4 md:gap-6 mt-1 md:mt-2">
                  <div className="text-left relative z-10">
                    <div className="text-[18px] md:text-[20px] text-black font-semibold tracking-[0.5px] mb-2 md:mb-3">
                      {fromCity}
                    </div>
                    <div className="text-[12px] md:text-[14px] text-black/70 font-medium tracking-[0.2px] -mt-1">
                      {mobileStartDate}
                    </div>
                  </div>
                  <div className="col-start-2 self-start mt-0 relative flex justify-center z-10">
                    <div className="relative w-full max-w-[460px] h-[44px] md:h-[60px] flex items-center justify-center">
                      <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 h-[2px] bg-[#333]" />
                      <span className="absolute right-[8%] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[12px] border-l-[#333] border-y-[8px] border-y-transparent" />
                    </div>
                  </div>
                  <div className="text-left col-start-3 relative z-10">
                    <div className="text-[18px] md:text-[20px] text-black font-semibold tracking-[0.5px] mb-2 md:mb-3">
                      {toCity}
                    </div>
                    <div className="text-[12px] md:text-[14px] text-black/70 font-medium tracking-[0.2px] -mt-1">
                      {mobileEndDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger & Class (mobile-only, above grid) */}
              <div
                className="md:hidden bg-black/20 border border-[#e5e5e5] rounded-3xl px-4 py-5 shadow-sm mb-4 w-full"
                style={{ width: "100%" }}
              >
                <div className="flex w-full items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#666] text-left">
                      Passenger
                    </div>
                    <div
                      ref={mobilePassengerValueRef}
                      className="font-semibold text-black whitespace-nowrap leading-tight text-lg"
                      style={{
                        fontSize: mobileValueFontSize
                          ? `${mobileValueFontSize}px`
                          : undefined,
                      }}
                    >
                      {name}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-sm text-[#666] text-right">Class</div>
                    <div
                      ref={mobileClassValueRef}
                      className="font-semibold text-black whitespace-nowrap leading-tight text-lg"
                      style={{
                        fontSize: mobileValueFontSize
                          ? `${mobileValueFontSize}px`
                          : undefined,
                      }}
                    >
                      {stubFlightClass}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger details grid */}
              <div className="grid grid-cols-3 text-center md:text-left md:grid-cols-[auto_minmax(8ch,1fr)_minmax(8ch,1fr)_minmax(5ch,1fr)_minmax(8ch,1fr)] gap-3 md:gap-8 pt-5 md:pt-6 md:border-t md:border-[#e5e5e5] mt-auto">
                <div className="hidden md:flex flex-col md:order-1">
                  <div className="text-xs md:text-[14px] text-[#666] mb-[5px]">
                    Passenger
                  </div>
                  <div className="detail-value text-black font-semibold tracking-[0.5px] text-sm md:text-base">
                    {name}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start order-1 md:order-2 min-w-0">
                  <div className="text-xs md:text-[14px] text-[#666] mb-[5px]">
                    Visa
                  </div>
                  <div className="detail-value whitespace-nowrap text-black font-semibold tracking-[0.5px] text-[11px] md:text-base">
                    {visa}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start order-2 md:order-3 min-w-0">
                  <div className="text-xs md:text-[14px] text-[#666] mb-[5px]">
                    Hotel
                  </div>
                  <div className="detail-value whitespace-nowrap text-black font-semibold tracking-[0.5px] text-[11px] md:text-base">
                    {hotel}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start order-3 md:order-4 min-w-0">
                  <div className="text-xs md:text-[14px] text-[#666] mb-[5px]">
                    Adult
                  </div>
                  <div className="detail-value whitespace-nowrap md:min-w-[3ch] text-black font-semibold tracking-[0.5px] text-[11px] md:text-base">
                    {adults}
                  </div>
                </div>
                {/* Mobile-only: Departure (Start Date) */}
                <div className="flex flex-col items-center order-5 md:hidden min-w-0">
                  <div className="text-xs text-[#666] mb-[5px]">Departure</div>
                  <div className="detail-value whitespace-nowrap text-black font-semibold tracking-[0.5px] text-[11px]">
                    {mobileStartDate}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start order-6 md:order-5 min-w-0">
                  <div className="text-xs md:text-[14px] text-[#666] mb-[5px]">
                    Children
                  </div>
                  <div className="detail-value whitespace-nowrap md:min-w-[3ch] text-black font-semibold tracking-[0.5px] text-[11px] md:text-base">
                    {children}
                  </div>
                </div>
                {/* Removed mobile-only single Date to avoid duplication; Start/End now shown above for all breakpoints */}
                <div className="flex flex-col items-center order-4 md:hidden min-w-0">
                  <div className="text-xs text-[#666] mb-[5px]">Airline</div>
                  <div className="detail-value whitespace-nowrap text-black font-semibold tracking-[0.5px] text-[11px]">
                    {mobileAirline}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STUB SECTION */}
          <div className="md:w-[35%] w-full min-w-0 bg-[#f7f7f7] p-0 flex flex-col relative md:border-l-2 md:border-dashed md:border-[#bdbdbd] border-t-0 md:border-t-0 border-[#bdbdbd]">
            {/* align header height/padding with left side; kill negative margins that caused the "raised" look */}
            <div className="bg-gradient-to-r from-black to-[#222222] px-10 h-[96px] hidden md:flex items-center justify-center text-white text-[22px] font-normal tracking-[2px] text-center">
              LeafWay Solution
            </div>
            <div className="flex-1 flex flex-col bg-[#f7f7f7] px-10 pt-7 pb-0">
              {/* Row 1: Passenger / Class */}
              <div className="hidden md:grid grid-cols-2 gap-5 md:gap-5 bg-white md:bg-transparent border md:border-0 border-[#e5e5e5] rounded-2xl md:rounded-none px-6 py-5 md:p-0 shadow-sm md:shadow-none">
                <div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666]">
                    Passenger
                  </div>
                  <div className="whitespace-nowrap text-base text-black font-semibold">
                    {name}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666]">
                    Class
                  </div>
                  <div className="whitespace-nowrap text-base text-black font-semibold">
                    {stubFlightClass}
                  </div>
                </div>
              </div>
              <div className="hidden md:block h-[2px] bg-[#e5e5e5] my-4" />

              {/* Row 2: Nationality / Airline (desktop only) */}
              <div className="hidden md:grid grid-cols-2 gap-5">
                <div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666]">
                    Nationality
                  </div>
                  <div className="whitespace-nowrap text-base text-black font-semibold">
                    {nationality}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666]">
                    Airline
                  </div>
                  <div className="whitespace-nowrap text-base text-black font-semibold">
                    {airline}
                  </div>
                </div>
              </div>
              <div className="hidden md:block h-[2px] bg-[#e5e5e5] my-4" />
            </div>
            {/* Barcode */}
            <div className="mt-auto pt-0 pb-6 md:pb-7 flex justify-center">
              <div
                className="w-[88%] h-[60px] md:h-[72px] rounded-[2px]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #111111 0 2px, transparent 2px 4px, #111111 4px 6px, transparent 6px 7px, #111111 7px 10px, transparent 10px 12px)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile tweaks to match your CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .detail-value {
            font-size: 1rem !important;
          }
        }
        @media (max-width: 480px) {
          .detail-label {
            font-size: 12px !important;
          }
          .detail-value {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
