import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/lib/db/client";
import {
  tripRequestActivities,
  tripRequests,
  type TripStatus,
} from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

import TripRequestsTable, {
  type StatusSummary,
  type TripRequestRow,
} from "../trip-requests-table";
import { StaggeredMenu } from "@/components/StaggeredMenu";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

async function loadTripLeads(): Promise<{
  tripRequests: TripRequestRow[];
  statusSummary: StatusSummary[];
}> {
  const [tripRequestsRows, statusSummaryRows] = await Promise.all([
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
      .limit(120),
    db
      .select({
        status: tripRequests.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tripRequests)
      .groupBy(tripRequests.status),
  ]);

  return {
    tripRequests: tripRequestsRows,
    statusSummary: statusSummaryRows,
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

function pipelineCount(summary: StatusSummary[], statuses: TripStatus[]) {
  const map = new Map<TripStatus, number>();
  for (const row of summary) {
    map.set(row.status, row.count);
  }
  return statuses.reduce((total, status) => total + (map.get(status) ?? 0), 0);
}

export default async function TripLeadsPage() {
  noStore();
  const data = await loadTripLeads();

  const total = data.statusSummary.reduce((total, row) => total + row.count, 0);
  const activePipeline = pipelineCount(data.statusSummary, [
    "new",
    "contacted",
    "quoted",
  ]);

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
        <div className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-16 pt-16">
          <header className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/65">
              Trip leads · Ledger
            </span>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Every enquiry, one table.
                </h1>
                <p className="max-w-2xl text-sm text-white/65 sm:text-base">
                  Use the filters to focus on the most urgent leads or read
                  straight down the list for context before you pick up the
                  phone.
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

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total leads"
              value={numberFormatter.format(total)}
            />
            <MetricCard
              label="Active pipeline"
              value={numberFormatter.format(activePipeline)}
            />
            <MetricCard
              label="Closed"
              value={numberFormatter.format(
                pipelineCount(data.statusSummary, ["closed"])
              )}
            />
            <MetricCard
              label="Archived"
              value={numberFormatter.format(
                pipelineCount(data.statusSummary, ["archived"])
              )}
            />
          </section>

          <section className="rounded-3xl border border-white/12 bg-white/[0.05] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
            <TripRequestsTable
              tripRequests={data.tripRequests.map((row) => ({
                ...row,
                createdAt: row.createdAt,
                startDate: row.startDate,
                endDate: row.endDate,
              }))}
              statusSummary={data.statusSummary}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-5">
      <div className="text-[12px] uppercase tracking-[0.32em] text-white/45">
        {label}
      </div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </div>
  );
}
