'use client';

import { useMemo, useState } from "react";
import type { TripStatus } from "@/lib/db/schema";

export type TripRequestRow = {
  id: string;
  createdAt: string | Date;
  passengerName: string;
  destination: string;
  origin: string;
  startDate: string | Date;
  endDate: string | Date;
  status: TripStatus;
  adults: number;
  kids: number;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  nationality: string;
  airlinePreference: string;
  hotelPreference: string;
  flightClass: string;
  visaStatus: string;
  activityCount: number;
};

export type StatusSummary = { status: TripStatus; count: number };

type TripRequestsTableProps = {
  tripRequests: TripRequestRow[];
  statusSummary: StatusSummary[];
};

type StatusOption = {
  value: TripStatus | 'all';
  label: string;
  hint: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'all',
    label: 'All',
    hint: 'Everything captured so far',
  },
  {
    value: 'new',
    label: 'New',
    hint: 'Yet to be contacted',
  },
  {
    value: 'contacted',
    label: 'Reached Out',
    hint: 'Agents have connected',
  },
  {
    value: 'quoted',
    label: 'Quoted',
    hint: 'Awaiting a decision',
  },
  {
    value: 'closed',
    label: 'Closed',
    hint: 'Confirmed & locked',
  },
  {
    value: 'archived',
    label: 'Archived',
    hint: 'Parked for later',
  },
];

const STATUS_BADGE_CLASSES: Record<TripStatus, string> = {
  new: 'bg-white/15 text-white',
  contacted: 'bg-white/12 text-white/80',
  quoted: 'bg-white/10 text-white/70',
  closed: 'bg-white text-black',
  archived: 'bg-black/60 text-white/45',
};

const STATUS_LABEL_MAP: Record<TripStatus, string> = {
  new: 'New',
  contacted: 'Reached Out',
  quoted: 'Quoted',
  closed: 'Closed',
  archived: 'Archived',
};

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
});

function toDate(value: string | Date) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateRange(start?: Date, end?: Date) {
  if (!start && !end) return '—';
  if (start && end) {
    const sameMonth =
      start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    const startLabel = dateFormatter.format(start);
    const endLabel = sameMonth
      ? `${end.getDate()}, ${end.getFullYear()}`
      : dateFormatter.format(end);
    return `${startLabel} → ${endLabel}`;
  }
  const date = start ?? end;
  return date ? dateFormatter.format(date) : '—';
}

function formatDateTime(date?: Date) {
  if (!date) return '—';
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

function statusCountMap(summary: StatusSummary[]) {
  return summary.reduce<Record<string, number>>((map, item) => {
    map[item.status] = item.count;
    return map;
  }, {});
}

export default function TripRequestsTable({
  tripRequests,
  statusSummary,
}: TripRequestsTableProps) {
  const [filter, setFilter] = useState<TripStatus | 'all'>('all');

  const counts = useMemo(() => statusCountMap(statusSummary), [statusSummary]);
  const totalCount = useMemo(
    () => statusSummary.reduce((total, row) => total + row.count, 0),
    [statusSummary]
  );

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return tripRequests;
    }
    return tripRequests.filter((row) => row.status === filter);
  }, [tripRequests, filter]);

  return (
    <div className="grid gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isActive = filter === option.value;
            const count =
              option.value === 'all'
                ? totalCount
                : counts[option.value as TripStatus] ?? 0;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value as TripStatus | 'all')}
                className={`group flex flex-col gap-1 rounded-2xl border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:min-w-[140px] ${
                  isActive
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 bg-transparent text-white'
                }`}
              >
                <span className="text-[12px] font-semibold uppercase tracking-[0.28em]">
                  {option.label}
                </span>
                <span
                  className={`text-lg font-bold ${
                    isActive ? 'text-black' : 'text-white'
                  }`}
                >
                  {count}
                </span>
                <span
                  className={`text-[11px] ${
                    isActive
                      ? 'text-black/70 group-hover:text-black'
                      : 'text-white/55 group-hover:text-white/80'
                  }`}
                >
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>
        <div className="rounded-full border border-white/20 px-4 py-1 text-[12px] uppercase tracking-[0.32em] text-white/55">
          {filtered.length} displayed
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-white/5 text-[12px] uppercase tracking-[0.28em] text-white/45">
              <th className="sticky left-0 z-30 border-r border-white/10 bg-[#0c0c0c]/95 px-4 py-3 font-semibold backdrop-blur-sm shadow-[12px_0_24px_rgba(0,0,0,0.45)] min-w-[260px]">
                Customer
              </th>
              <th className="px-4 py-3 font-semibold min-w-[220px]">Trip</th>
              <th className="px-4 py-3 font-semibold min-w-[160px]">Status</th>
              <th className="px-4 py-3 font-semibold min-w-[220px]">Contact</th>
              <th className="px-4 py-3 font-semibold min-w-[240px]">Preferences</th>
              <th className="px-4 py-3 font-semibold min-w-[200px]">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-white/45">
                  Nothing here yet. Adjust the filters or wait for fresh leads.
                </td>
              </tr>
            ) : (
              filtered.map((request, index) => {
                const createdAt = toDate(request.createdAt);
                const startDate = toDate(request.startDate);
                const endDate = toDate(request.endDate);

                return (
                  <tr
                    key={request.id}
                    className={
                      index % 2 === 0
                        ? 'bg-white/3 text-white'
                        : 'bg-black/20 text-white'
                    }
                  >
                    <td className="sticky left-0 z-20 border-r border-white/10 bg-[#050505]/95 px-4 py-4 align-top backdrop-blur-sm shadow-[12px_0_24px_rgba(0,0,0,0.45)] min-w-[260px]">
                      <div className="font-semibold text-white">{request.passengerName}</div>
                      <div className="mt-1 text-[12px] text-white/50">
                        {request.nationality}
                      </div>
                      <div className="mt-2 inline-flex rounded-full border border-white/20 px-2 py-0.5 text-[11px] uppercase tracking-[0.28em] text-white/60">
                        {request.activityCount} activities
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-white/80 min-w-[220px]">
                      <div className="font-medium text-white">
                        {request.origin} → {request.destination}
                      </div>
                      <div className="mt-1 text-[12px] text-white/50">
                        {formatDateRange(startDate, endDate)}
                      </div>
                      <div className="mt-1 text-[12px] text-white/45">
                        {request.adults} adults · {request.kids} kids
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top min-w-[160px]">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.28em] ${
                          STATUS_BADGE_CLASSES[request.status]
                        }`}
                      >
                        {STATUS_LABEL_MAP[request.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-white/80 min-w-[220px]">
                      <div>{request.email}</div>
                      <div className="mt-1 text-[12px] text-white/55">
                        +{request.phoneCountryCode} {request.phoneNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-white/70 min-w-[240px]">
                      <div className="text-[13px]">
                        Airline · {request.airlinePreference}
                      </div>
                      <div className="text-[13px]">
                        Hotel · {request.hotelPreference}
                      </div>
                      <div className="text-[13px]">
                        Cabin · {request.flightClass}
                      </div>
                      <div className="text-[13px]">
                        Visa · {request.visaStatus}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-white/60 min-w-[200px]">
                      {formatDateTime(createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
