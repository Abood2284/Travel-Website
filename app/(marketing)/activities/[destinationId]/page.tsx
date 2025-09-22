import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { and, eq } from "drizzle-orm";

import { DESTINATIONS } from "@/lib/const";
import { activities } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { AddToPlanButton } from "@/components/activities/AddToPlanButton";

function formatPrice(raw: string | number | null, currency: string) {
  const numericValue = typeof raw === "number" ? raw : Number(raw ?? 0);
  if (!Number.isFinite(numericValue)) {
    return `${raw ?? ""} ${currency}`.trim();
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${numericValue.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} ${currency}`;
  }
}

type ActivitiesPageProps = {
  params: Promise<{ destinationId: string }>;
  searchParams?: Promise<{ tripRequestId?: string }>;
};

export default async function ActivitiesPage({
  params,
  searchParams,
}: ActivitiesPageProps) {
  const resolvedParams = params ? await params : { destinationId: "" };
  const resolvedSearchParams = searchParams ? await searchParams : null;

  const destination = DESTINATIONS.find(
    (entry) => entry.id === resolvedParams.destinationId
  );
  if (!destination) notFound();

  const records = await db
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.destinationId, destination.id),
        eq(activities.isActive, true)
      )
    )
    .orderBy(activities.name);

  const tripRequestId =
    typeof resolvedSearchParams?.tripRequestId === "string" &&
    resolvedSearchParams.tripRequestId.length > 0
      ? resolvedSearchParams.tripRequestId
      : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-20 text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to planner
          </Link>
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                Activities & Experiences
              </span>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {destination.name}
                <span className="pl-2 text-white/60">
                  • {destination.country}
                </span>
              </h1>
            </div>
            <p className="max-w-2xl text-sm text-white/70 sm:text-base">
              A monochrome concierge of standout stops—sightlines, flavours,
              nightcaps—built to complement the itinerary you just printed.
              Choose the moments that matter; we’ll weave them into your quote.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        {records.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Activities coming soon
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              We’re curating exceptional experiences for this destination. Check
              back shortly or explore another city above.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {records.map((activity) => {
              const formattedPrice = formatPrice(
                activity.price,
                activity.currency
              );
              return (
                <div
                  key={activity.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${activity.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                    <div className="absolute top-4 right-4 inline-flex items-center justify-center">
                      <div className="relative inline-flex items-center justify-center">
                        <span
                          className="absolute inline-flex h-full w-full rounded-full bg-slate-200 opacity-70 blur-sm animate-ping"
                          aria-hidden="true"
                        />
                        <span className="relative inline-flex items-center justify-center rounded-full bg-white/95 px-4 py-1 text-sm font-semibold text-slate-900 shadow">
                          {formattedPrice}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                      {destination.name}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <header className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {activity.name}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {activity.description}
                      </p>
                    </header>
                    <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Star
                          className="size-4 fill-slate-900 text-slate-900"
                          aria-hidden
                        />
                        {activity.reviewCount.toLocaleString()} reviews
                      </span>
                      <span>{destination.country}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/activities/${destination.id}/${activity.id}${
                          tripRequestId ? `?tripRequestId=${tripRequestId}` : ""
                        }`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                      >
                        View details
                      </Link>
                      <AddToPlanButton
                        activityId={activity.id}
                        tripRequestId={tripRequestId}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export function generateStaticParams() {
  return DESTINATIONS.map((destination) => ({ destinationId: destination.id }));
}
