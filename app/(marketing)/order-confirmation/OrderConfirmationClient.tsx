"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

import BoardingPass from "@/components/trip-builder/BoardingPass";
import { AddToPlanButton } from "@/components/activities/AddToPlanButton";

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

type ActivityCard = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  reviewCount: number;
  imageUrl: string;
  added: boolean;
};

type DestinationInfo = {
  id: string;
  name: string;
  country: string;
} | null;

type OrderConfirmationClientProps = {
  firstName: string;
  destinationLabel: string;
  referenceShort: string | null;
  boardingPass: BoardingPassProps;
  destination: DestinationInfo;
  activities: ActivityCard[];
  tripRequestId: string | null;
};

export default function OrderConfirmationClient({
  firstName,
  destinationLabel,
  referenceShort,
  boardingPass,
  destination,
  activities,
  tripRequestId,
}: OrderConfirmationClientProps) {
  const [addedState, setAddedState] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    activities.forEach((activity) => {
      if (activity.added) initial[activity.id] = true;
    });
    return initial;
  });

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

      <section className="relative z-20 bg-white text-slate-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <header className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Addon
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Enhance your time in {destination ? destination.name : "destination"}
            </h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Curated activities to layer onto your itinerary. Reserve the moments that matter while we finalize the rest.
            </p>
          </header>

          {activities.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h3 className="text-2xl font-semibold text-slate-900">Activities coming soon</h3>
              <p className="mt-3 text-sm text-slate-600">
                We’re curating exceptional experiences for this destination. Check back shortly or explore another city with our concierge.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {activities.map((activity) => {
                const isAdded = addedState[activity.id] ?? activity.added;
                return (
                  <div
                    key={activity.id}
                    className={`group flex h-full flex-col overflow-hidden rounded-[32px] border shadow-[0_24px_60px_rgba(15,23,42,0.08)] ${
                      isAdded
                        ? "border-slate-200 bg-slate-100 opacity-70"
                        : "border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)]"
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${activity.imageUrl})` }}
                        aria-hidden
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      <div className="absolute top-4 right-4 inline-flex items-center justify-center">
                        <div className="relative inline-flex items-center justify-center">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-slate-200 opacity-70 blur-sm animate-ping" aria-hidden />
                          <span className="relative inline-flex items-center justify-center rounded-full bg-white/95 px-4 py-1 text-sm font-semibold text-slate-900 shadow">
                            {activity.priceLabel}
                          </span>
                        </div>
                      </div>
                      {destination && (
                        <div className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                          {destination.name}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <header className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900">{activity.name}</h3>
                        <p className="text-sm text-slate-600 line-clamp-3">{activity.description}</p>
                    </header>
                    <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-4 fill-slate-900 text-slate-900" aria-hidden />
                        {activity.reviewCount.toLocaleString()} reviews
                      </span>
                      <span>{destination?.country}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      {isAdded ? (
                        <div className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Activity already added
                        </div>
                      ) : (
                        <>
                          {destination && (
                            <Link
                              href={`/activities/${destination.id}/${activity.id}${
                                tripRequestId ? `?tripRequestId=${tripRequestId}` : ""
                              }`}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                            >
                              View details
                            </Link>
                          )}
                          <AddToPlanButton
                            activityId={activity.id}
                            tripRequestId={tripRequestId}
                            onAdded={() =>
                              setAddedState((prev) => ({
                                ...prev,
                                [activity.id]: true,
                              }))
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}

            </div>
          )}
        </div>
      </section>
    </main>
  );
}
