"use client";

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
  const name = props.passengerName || "GUEST";
  const visa = props.visaStatus || "N/A";
  const adults = typeof props.adults === "number" ? props.adults : 1;
  const children = typeof props.children === "number" ? props.children : 0;
  const airline = props.airline || "—";
  const nationality = props.nationality || "—";
  const hotel = props.hotelPref || "3 Star";
  const flightClass = (props.flightClass || "ECONOMY").toUpperCase();

  const FROM = props.iataFrom || "JFK";
  const TO = props.iataTo || "CDG";
  const fromCity = props.fromCity || "NEW YORK";
  const toCity = props.toCity || "PARIS";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5">
      <div className="w-full max-w-[900px] mx-auto">
        <div className="relative bg-white rounded-[28px] overflow-hidden shadow-[0_14px_40px_rgba(0,0,0,0.18)] flex md:flex-row flex-col">
          {/* MAIN SECTION */}
          <div className="flex-1 min-w-[65%] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#5B6FE6] to-[#7B8CE8] text-white px-10 h-[96px] flex items-center justify-between">
              <h1 className="text-[40px] font-medium tracking-[6px]">
                BOARDING PASS
              </h1>
            </div>

            {/* Flight info */}
            <div className="px-10 py-7 bg-[#f8f7fd] flex-1 flex flex-col">
              {/* Route (fixed: dynamic baseline between codes) */}
              <div className="relative mb-7">
                <div className="pointer-events-none absolute inset-0 z-0">
                  <div
                    className="absolute inset-0 opacity-[0.08]"
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
                      WebkitMaskImage: "url('/images/plane.svg')",
                      maskImage: "url('/images/plane.svg')",
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
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6">
                  {/* Left: FROM + IATA */}
                  <div className="relative z-10 pr-2">
                    <div className="text-base text-[#666] mb-1">FROM:</div>
                    <div className="text-[52px] font-bold text-[#5B6FE6] tracking-[2px] leading-none">
                      {FROM}
                    </div>
                  </div>

                  {/* Placeholder keeps center column width so TO/CDG stay aligned */}
                  <div className="relative flex-1 h-[60px] opacity-0 pointer-events-none">
                    <div className="relative w-full max-w-[460px] h-full flex items-center justify-center">
                      <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 h-[2px] bg-[#333]" />
                      <span className="absolute right-[8%] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[12px] border-l-[#333] border-y-[8px] border-y-transparent" />
                    </div>
                  </div>

                  {/* Right: TO + IATA */}
                  <div className="relative z-10 pl-2">
                    <div className="text-base text-[#666] mb-1">TO:</div>
                    <div className="text-[52px] font-extrabold text-[#5B6FE6] tracking-[1px] leading-none">
                      {TO}
                    </div>
                  </div>
                </div>

                {/* Secondary info under the codes */}
                <div className="grid grid-cols-[auto_1fr_auto] items-start gap-6 mt-2">
                  <div className="text-left relative z-10">
                    <div className="text-[20px] text-[#5B6FE6] font-semibold tracking-[0.5px] mb-3">
                      {fromCity}
                    </div>
                  </div>
                  <div className="col-start-2 self-start mt-0 relative flex justify-center z-10">
                    <div className="relative w-full max-w-[460px] h-[60px] flex items-center justify-center">
                      <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 h-[2px] bg-[#333]" />
                      <span className="absolute right-[8%] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[12px] border-l-[#333] border-y-[8px] border-y-transparent" />
                    </div>
                  </div>
                  <div className="text-left col-start-3 relative z-10">
                    <div className="text-[22px] text-[#5B6FE6] font-semibold tracking-[0.5px]">
                      {toCity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger details grid */}
              <div className="grid grid-cols-[1fr_fit-content(10ch)_fit-content(8ch)_min-content_min-content] gap-8 pt-6 border-t border-[#ddd] mt-auto">
                <div className="flex flex-col">
                  <div className="text-[14px] text-[#666] mb-[5px]">
                    Passenger
                  </div>
                  <div className="detail-value text-[#5B6FE6] font-semibold tracking-[0.5px] text-base">
                    {name}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[14px] text-[#666] mb-[5px]">Visa</div>
                  <div className="detail-value whitespace-nowrap text-[#5B6FE6] font-semibold tracking-[0.5px] text-base">
                    {visa}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[14px] text-[#666] mb-[5px]">Hotel</div>
                  <div className="detail-value whitespace-nowrap text-[#5B6FE6] font-semibold tracking-[0.5px] text-base">
                    {hotel}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[14px] text-[#666] mb-[5px]">Adult</div>
                  <div className="detail-value whitespace-nowrap min-w-[3ch] text-[#5B6FE6] font-semibold tracking-[0.5px] text-base">
                    {adults}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[14px] text-[#666] mb-[5px]">
                    Children
                  </div>
                  <div className="detail-value whitespace-nowrap min-w-[3ch] text-[#5B6FE6] font-semibold tracking-[0.5px] text-base">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STUB SECTION */}
          <div className="md:w-[35%] w-full min-w-0 bg-[#f8f7fd] p-0 flex flex-col relative md:border-l-2 md:border-dashed md:border-[#ccc] border-t-2 md:border-t-0 border-[#ccc]">
            {/* align header height/padding with left side; kill negative margins that caused the "raised" look */}
            <div className="bg-gradient-to-r from-[#7B8CE8] to-[#8B9AEA] px-10 h-[96px] flex items-center justify-center text-white text-[22px] font-normal tracking-[2px] text-center">
              LeafWay Solution
            </div>
            <div className="flex-1 flex flex-col bg-[#f8f7fd] px-10 pt-7 pb-0">
              {/* Row 1: Passenger / Class */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666]">
                    Passenger
                  </div>
                  <div className="whitespace-nowrap text-base text-[#5B6FE6] font-semibold">
                    {name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666]">
                    Airline
                  </div>
                  <div className="whitespace-nowrap text-base text-[#5B6FE6] font-semibold">
                    {airline}
                  </div>
                </div>
              </div>
              <div className="h-[2px] bg-[#e9e9f4] my-4" />

              {/* Row 2: Date / Boarding / Depart */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666]">
                    Nationality
                  </div>
                  <div className="whitespace-nowrap text-base text-[#5B6FE6] font-semibold">
                    {nationality}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666]">
                    Class
                  </div>
                  <div className="whitespace-nowrap text-base text-[#5B6FE6] font-semibold">
                    {flightClass}
                  </div>
                </div>
              </div>
              <div className="h-[2px] bg-[#e9e9f4] my-4" />
            </div>
            {/* Barcode */}
            <div className="mt-auto pt-0 pb-7 flex justify-center">
              <div
                className="w-[88%] h-[72px] rounded-[2px]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #101623 0 2px, transparent 2px 4px, #101623 4px 6px, transparent 6px 7px, #101623 7px 10px, transparent 10px 12px)",
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
