"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import BoardingPass from "@/components/trip-builder/BoardingPass";

type BoardingPassProps = {
  fromCity: string;
  toCity: string;
  iataFrom: string;
  iataTo: string;
  departDate?: string;
  returnDate?: string;
  passengerName: string;
  visaStatus: string;
  adults: number;
  children: number;
  airline: string;
  nationality: string;
  hotelPref: string;
  flightClass: string;
};

type OrderConfirmationClientProps = {
  firstName: string;
  destinationLabel: string;
  referenceShort: string | null;
  boardingPass: BoardingPassProps;
};

export default function OrderConfirmationClient({
  firstName,
  destinationLabel,
  referenceShort,
  boardingPass,
}: OrderConfirmationClientProps) {

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_65%)]"
        aria-hidden
      />
      <div
        className="absolute -top-40 left-1/2 h-[520px] w-[140%] -translate-x-1/2 rounded-full bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 opacity-75 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <Link
          href="/#how-it-works"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to How it works
        </Link>
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
          Request submitted
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
          Bon voyage, {firstName}!
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
          Your itinerary for {destinationLabel} is with our travel designers. Expect a personal note soon with
          confirmations, upgrades, and next steps.
        </p>
        {referenceShort && (
          <div className="mt-6 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            Ref&nbsp;#{referenceShort}
          </div>
        )}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20">
        <div className="rounded-[36px] border border-white/10 bg-white/5 p-3 backdrop-blur-lg">
          <BoardingPass
            fromCity={boardingPass.fromCity}
            toCity={boardingPass.toCity}
            iataFrom={boardingPass.iataFrom}
            iataTo={boardingPass.iataTo}
            departDate={boardingPass.departDate}
            arriveDate={boardingPass.returnDate}
            passengerName={boardingPass.passengerName}
            visaStatus={boardingPass.visaStatus}
            adults={boardingPass.adults}
            children={boardingPass.children}
            airline={boardingPass.airline}
            nationality={boardingPass.nationality}
            hotelPref={boardingPass.hotelPref}
            flightClass={boardingPass.flightClass}
          />
        </div>
      </div>
    </main>
  );
}
