import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { and, eq } from "drizzle-orm";

import { DESTINATIONS } from "@/lib/const";
import { activities } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { AddToPlanButton } from "@/components/activities/AddToPlanButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ActivityPageProps = {
  params: Promise<{ destinationId: string; activityId: string }>;
  searchParams?: Promise<{ tripRequestId?: string }>;
};

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

export default async function ActivityDetailPage({
  params,
  searchParams,
}: ActivityPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : null;

  const destination = DESTINATIONS.find(
    (entry) => entry.id === resolvedParams.destinationId
  );
  if (!destination) notFound();

  const record = await db
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.id, resolvedParams.activityId),
        eq(activities.destinationId, destination.id),
        eq(activities.isActive, true)
      )
    )
    .limit(1);

  const activity = record[0];
  if (!activity) notFound();

  const formattedPrice = formatPrice(activity.price, activity.currency);
  const tripRequestId =
    typeof resolvedSearchParams?.tripRequestId === "string" &&
    resolvedSearchParams.tripRequestId.length > 0
      ? resolvedSearchParams.tripRequestId
      : null;

  const orderConfirmationQuery = new URLSearchParams();
  if (tripRequestId) orderConfirmationQuery.set("tripRequestId", tripRequestId);
  orderConfirmationQuery.set("destinationId", destination.id);
  const queryString = orderConfirmationQuery.toString();
  const orderConfirmationHref = `/order-confirmation${
    queryString.length > 0 ? `?${queryString}` : ""
  }`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <Link
              href={orderConfirmationHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to confirmation
            </Link>
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                Signature Experience
              </span>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {activity.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span>
                  {destination.name}, {destination.country}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-white text-white" aria-hidden />
                  {activity.reviewCount.toLocaleString()} reviews
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur">
            <span className="text-xs uppercase tracking-[0.35em] text-white/60">
              Investment
            </span>
            <span className="text-3xl font-black text-white">
              {formattedPrice}
            </span>
            <AddToPlanButton
              activityId={activity.id}
              tripRequestId={tripRequestId}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">
              Experience overview
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {activity.description}
            </p>
          </div>
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <div className="flex items-start justify-between">
              <span className="font-semibold text-slate-900">Destination</span>
              <span>
                {destination.name}, {destination.country}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="font-semibold text-slate-900">Pricing</span>
              <span>{formattedPrice}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="font-semibold text-slate-900">Reviews</span>
              <span>{activity.reviewCount.toLocaleString()} travellers</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div
            className="h-80 bg-cover bg-center transition duration-500 lg:h-full"
            style={{ backgroundImage: `url(${activity.imageUrl})` }}
          />
        </div>
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  try {
    const rows = await db
      .select({
        destinationId: activities.destinationId,
        activityId: activities.id,
      })
      .from(activities)
      .where(eq(activities.isActive, true));

    return rows.map((row) => ({
      destinationId: row.destinationId,
      activityId: row.activityId,
    }));
  } catch {
    return [] as { destinationId: string; activityId: string }[];
  }
}
