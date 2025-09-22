import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/lib/db/client";
import {
  activities,
  tripRequestActivities,
  tripRequests,
  type TripStatus,
} from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

import TripRequestsTable, {
  type StatusSummary,
  type TripRequestRow,
} from "./trip-requests-table";
import { StaggeredMenu } from "@/components/StaggeredMenu";

type DestinationBreakdown = {
  destination: string;
  count: number;
};

type ActivityRow = {
  id: string;
  destinationId: string;
  name: string;
  price: string;
  currency: string;
  isActive: boolean;
  reviewCount: number;
  createdAt: string | Date;
};

type DashboardData = {
  tripRequests: TripRequestRow[];
  statusSummary: StatusSummary[];
  destinationBreakdown: DestinationBreakdown[];
  activities: ActivityRow[];
  activityCounts: { active: number; inactive: number };
};

const PIPELINE_ORDER: TripStatus[] = [
  "new",
  "contacted",
  "quoted",
  "closed",
  "archived",
];

const STATUS_LABELS: Record<TripStatus, string> = {
  new: "New",
  contacted: "Reached Out",
  quoted: "Quoted",
  closed: "Closed",
  archived: "Archived",
};

const statusCardCopy: Record<TripStatus, { hint: string }> = {
  new: {
    hint: "Fresh leads waiting for first touchpoint",
  },
  contacted: {
    hint: "Agents have made initial outreach",
  },
  quoted: {
    hint: "Proposal shared, awaiting decision",
  },
  closed: {
    hint: "Confirmed trips ready for fulfillment",
  },
  archived: {
    hint: "No longer active, parked for reference",
  },
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});

async function loadDashboardData(): Promise<DashboardData> {
  const [
    tripRequestsRows,
    statusSummaryRows,
    destinationRows,
    activityRows,
    activityStatusRows,
  ] = await Promise.all([
    db
      .select({
        id: tripRequests.id,
        createdAt: tripRequests.createdAt,
        passengerName: tripRequests.passengerName,
        destination: tripRequests.destination,
        origin: tripRequests.origin,
        startDate: tripRequests.startDate,
        endDate: tripRequests.endDate,
        status: tripRequests.status,
        adults: tripRequests.adults,
        kids: tripRequests.kids,
        email: tripRequests.email,
        phoneCountryCode: tripRequests.phoneCountryCode,
        phoneNumber: tripRequests.phoneNumber,
        nationality: tripRequests.nationality,
        airlinePreference: tripRequests.airlinePreference,
        hotelPreference: tripRequests.hotelPreference,
        flightClass: tripRequests.flightClass,
        visaStatus: tripRequests.visaStatus,
        activityCount: sql<number>`count(${tripRequestActivities.id})::int`,
      })
      .from(tripRequests)
      .leftJoin(
        tripRequestActivities,
        eq(tripRequestActivities.tripRequestId, tripRequests.id)
      )
      .groupBy(tripRequests.id)
      .orderBy(desc(tripRequests.createdAt))
      .limit(50),
    db
      .select({
        status: tripRequests.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tripRequests)
      .groupBy(tripRequests.status),
    db
      .select({
        destination: tripRequests.destination,
        count: sql<number>`count(*)::int`,
      })
      .from(tripRequests)
      .groupBy(tripRequests.destination)
      .orderBy(desc(sql`count(*)`))
      .limit(8),
    db
      .select({
        id: activities.id,
        destinationId: activities.destinationId,
        name: activities.name,
        price: activities.price,
        currency: activities.currency,
        isActive: activities.isActive,
        reviewCount: activities.reviewCount,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .orderBy(desc(activities.updatedAt))
      .limit(16),
    db
      .select({
        isActive: activities.isActive,
        count: sql<number>`count(*)::int`,
      })
      .from(activities)
      .groupBy(activities.isActive),
  ]);

  const activityCounts = activityStatusRows.reduce(
    (acc, row) => {
      if (row.isActive) {
        acc.active += row.count;
      } else {
        acc.inactive += row.count;
      }
      return acc;
    },
    { active: 0, inactive: 0 }
  );

  return {
    tripRequests: tripRequestsRows,
    statusSummary: statusSummaryRows,
    destinationBreakdown: destinationRows,
    activities: activityRows,
    activityCounts,
  };
}

function toDateString(value: string | Date) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function tripCount(data: StatusSummary[], statuses: TripStatus[]) {
  const map = new Map<TripStatus, number>();
  for (const row of data) {
    map.set(row.status, row.count);
  }
  return statuses.reduce((total, status) => total + (map.get(status) ?? 0), 0);
}

export default async function AdminDashboardPage() {
  noStore();
  const data = await loadDashboardData();

  const totalTripRequests = data.statusSummary.reduce(
    (total, row) => total + row.count,
    0
  );
  const inPipelineCount = tripCount(data.statusSummary, [
    "new",
    "contacted",
    "quoted",
  ]);
  const closedCount = tripCount(data.statusSummary, ["closed"]);
  const archivedCount = tripCount(data.statusSummary, ["archived"]);

  const mostActiveDestination = data.destinationBreakdown.at(0);

  const menuItems = [
    {
      label: "Dashboard",
      ariaLabel: "Go to admin dashboard",
      link: "/leafway/solutions/admin",
    },
    {
      label: "Trip Requests",
      ariaLabel: "View trip requests",
      link: "/leafway/solutions/admin/trip-requests",
    },
    {
      label: "Activities",
      ariaLabel: "Manage activities",
      link: "/activities",
    },
    {
      label: "Analytics",
      ariaLabel: "View analytics",
      link: "/leafway/solutions/admin/analytics",
    },
  ];

  const socialItems = [
    {
      label: "GitHub",
      link: "https://github.com",
    },
    {
      label: "LinkedIn",
      link: "https://linkedin.com",
    },
    {
      label: "Twitter",
      link: "https://twitter.com",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white relative">
      <StaggeredMenu
        position="right"
        colors={["#1e1e22", "#35353c", "#4a4a52"]}
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        logoUrl="/images/plane.svg"
        menuButtonColor="#e9e9ef"
        openMenuButtonColor="#e9e9ef"
        accentColor="#5227FF"
        changeMenuColorOnOpen={false}
        className="fixed inset-0 z-50 h-screen"
      />
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-16 pt-16">
          <header className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/65">
              LeafWay Solutions · Admin
            </span>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[44px]">
                  Operations command center.
                </h1>
                <p className="max-w-2xl text-sm text-white/65 sm:text-base">
                  Live pipeline pulse for incoming trip requests, destination
                  coverage, and activity inventory. Everything monochrome, so
                  the next call stays the focus.
                </p>
              </div>
              <div className="grid gap-1 text-right text-xs uppercase tracking-[0.35em] text-white/45">
                <span>Last refreshed</span>
                <span className="text-[13px] tracking-[0.28em] text-white">
                  {toDateString(new Date())}
                </span>
              </div>
            </div>
          </header>

          <section>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total leads"
                value={numberFormatter.format(totalTripRequests)}
                hint="All trip requests captured"
              />
              <SummaryCard
                label="Active pipeline"
                value={numberFormatter.format(inPipelineCount)}
                hint="New, contacted, and quoted"
              />
              <SummaryCard
                label="Trips closed"
                value={numberFormatter.format(closedCount)}
                hint="Confirmed and ready"
              />
              <SummaryCard
                label="Archived"
                value={numberFormatter.format(archivedCount)}
                hint="Filed away for reference"
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
            <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold uppercase tracking-[0.28em] text-white/60">
                    Trip requests
                  </h2>
                  <p className="mt-2 text-sm text-white/55">
                    Review each submission, filter by status, and grab the
                    contact details needed for the next outreach.
                  </p>
                </div>
                <div className="rounded-full border border-white/15 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/65">
                  Showing {data.tripRequests.length} newest
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-black/30">
                <TripRequestsTable
                  tripRequests={data.tripRequests.map((row) => ({
                    ...row,
                    createdAt: row.createdAt,
                    startDate: row.startDate,
                    endDate: row.endDate,
                  }))}
                  statusSummary={data.statusSummary}
                />
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
                <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-white/60">
                  Pipeline distribution
                </h2>
                <p className="mt-2 text-sm text-white/55">
                  Snapshot of each stage. Use the toggles on the left to focus
                  the table.
                </p>
                <div className="mt-4 space-y-3">
                  {PIPELINE_ORDER.map((status) => {
                    const count =
                      data.statusSummary.find((item) => item.status === status)
                        ?.count ?? 0;
                    const share = totalTripRequests
                      ? count / totalTripRequests
                      : 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 min-w-[32px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                              {status.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-white">
                              {STATUS_LABELS[status]}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 text-[13px]">
                            <span>{numberFormatter.format(count)}</span>
                            <span className="text-white/45">
                              {percentageFormatter.format(share)}
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-white"
                            style={{ width: `${Math.max(share * 100, 8)}%` }}
                          />
                        </div>
                        <p className="text-[12px] text-white/45">
                          {statusCardCopy[status].hint}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
                <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-white/60">
                  Destination traction
                </h2>
                <p className="mt-2 text-sm text-white/55">
                  {mostActiveDestination
                    ? `Most requested: ${mostActiveDestination.destination}`
                    : "Awaiting the first request."}
                </p>
                <div className="mt-5 space-y-3">
                  {data.destinationBreakdown.map((item, index) => {
                    const share = totalTripRequests
                      ? item.count / totalTripRequests
                      : 0;
                    return (
                      <div
                        key={item.destination || `destination-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                      >
                        <div className="flex flex-col text-sm">
                          <span className="font-semibold text-white">
                            {item.destination || "Unspecified"}
                          </span>
                          <span className="text-[12px] uppercase tracking-[0.35em] text-white/45">
                            {percentageFormatter.format(share)} share
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-white">
                          {numberFormatter.format(item.count)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold uppercase tracking-[0.28em] text-white/60">
                  Activity inventory
                </h2>
                <p className="mt-2 text-sm text-white/55">
                  {numberFormatter.format(data.activityCounts.active)} active
                  experiences ·{" "}
                  {numberFormatter.format(data.activityCounts.inactive)} on
                  standby
                </p>
              </div>
              <div className="rounded-full border border-white/15 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/65">
                Latest {data.activities.length} listings
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-black/30">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-white/5 text-[12px] uppercase tracking-[0.28em] text-white/45">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Activity</th>
                    <th className="px-4 py-3 font-semibold">Destination</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Reviews</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activities.map((activity, index) => {
                    const priceNumber = Number(activity.price);
                    const formattedPrice = Number.isFinite(priceNumber)
                      ? `${priceNumber.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })} ${activity.currency}`
                      : `${activity.price} ${activity.currency}`;

                    return (
                      <tr
                        key={activity.id}
                        className={
                          index % 2 === 0 ? "bg-white/3" : "bg-black/10"
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">
                            {activity.name}
                          </div>
                          <div className="text-[12px] text-white/45">
                            #{activity.id.slice(0, 8)} ·{" "}
                            {activity.destinationId}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {activity.destinationId}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {formattedPrice}
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {activity.reviewCount}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill
                            label={activity.isActive ? "Active" : "Inactive"}
                            tone={activity.isActive ? "light" : "muted"}
                          />
                        </td>
                        <td className="px-4 py-3 text-white/55">
                          {toDateString(activity.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {data.activities.length === 0 ? (
                <div className="p-6 text-center text-sm text-white/45">
                  No activities recorded yet.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
};

function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-[0_18px_56px_rgba(0,0,0,0.32)] backdrop-blur">
      <div className="text-[12px] uppercase tracking-[0.35em] text-white/45">
        {label}
      </div>
      <div className="mt-3 text-4xl font-black text-white">{value}</div>
      {hint ? <div className="mt-3 text-sm text-white/55">{hint}</div> : null}
    </div>
  );
}

type StatusPillProps = {
  label: string;
  tone?: "light" | "muted";
};

function StatusPill({ label, tone = "light" }: StatusPillProps) {
  const toneClasses =
    tone === "light"
      ? "border-white/20 bg-white/15 text-white"
      : "border-white/15 bg-black/40 text-white/65";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium uppercase tracking-[0.3em] ${toneClasses}`}
    >
      {label}
    </span>
  );
}
