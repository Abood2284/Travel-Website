// Use native <img> to avoid Next/Image hostname restrictions when debugging
// external image fetches (Cloudinary, etc.). Replace with Next/Image later
// once domains are confirmed in next.config.ts.
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToPlanButton } from "@/components/activities/AddToPlanButton";
import { getActivityById, getAllActivities } from "@/lib/db";
import { Check, ChevronLeft } from "lucide-react";

/* ----------------- helpers ----------------- */

/** DB stores literal "\\n". Convert and tidy. */
function sanitizeDescription(raw?: string) {
  if (!raw) return "";
  let cleaned = raw.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\s+\n/g, "\n").trim();
  return cleaned;
}

/** Detect SHOUTY headings. */
function isHeadingLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^[-•*]\s+/.test(trimmed)) return false;
  if (trimmed.length > 100) return false;

  const lettersOnly = trimmed.replace(/[0-9\-–—.;:,()'"\s/]/g, "");
  if (!/[A-Za-z]/.test(lettersOnly)) return false;

  const isMostlyUpper =
    lettersOnly === lettersOnly.toUpperCase() &&
    lettersOnly !== lettersOnly.toLowerCase();

  return isMostlyUpper;
}

/** Nicer section titles. */
function prettyTitle(raw?: string) {
  if (!raw || raw.trim() === "") return "About this experience";

  const map: Record<string, string> = {
    "WHAT'S INCLUDED": "What's Included",
    "WHO IT'S FOR / ELIGIBILITY": "Who It's For",
    "WHAT YOU'LL ACTUALLY DO": "What You'll Do",
    "REQUIREMENTS & RULES (IMPORTANT)": "Before You Go",
    "GOOD TO KNOW": "Good To Know",
    "TL;DR": "Why This Is Worth It",
  };

  if (map[raw.trim()]) return map[raw.trim()];
  const lower = raw.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Turn the description into structured sections. */
function parseSections(raw?: string) {
  const description = sanitizeDescription(raw);
  if (!description) return [];

  const lines = description.split("\n");

  type Section = { title?: string; paragraphs: string[]; bullets: string[] };
  const sections: Section[] = [];
  let current: Section = { title: undefined, paragraphs: [], bullets: [] };

  function pushCurrent() {
    const hasStuff =
      (current.title && current.title.trim() !== "") ||
      current.paragraphs.length > 0 ||
      current.bullets.length > 0;
    if (hasStuff) sections.push(current);
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    if (isHeadingLine(line)) {
      pushCurrent();
      current = { title: prettyTitle(line), paragraphs: [], bullets: [] };
      continue;
    }

    if (/^[-•*]\s+/.test(line)) {
      const bullet = line.replace(/^[-•*]\s+/, "").trim();
      current.bullets.push(bullet);
      continue;
    }

    current.paragraphs.push(line);
  }

  pushCurrent();

  if (sections.length > 0 && (!sections[0].title || sections[0].title === "")) {
    sections[0].title = "About this experience";
  }

  return sections;
}

/** Short hero teaser. */
function getHeroSnippetFromSections(
  sections: ReturnType<typeof parseSections>
) {
  if (!sections.length) return "";
  const firstSec = sections[0];
  let snippet = firstSec.paragraphs[0] || "";
  if (!snippet) return "";
  if (snippet.length > 220) snippet = snippet.slice(0, 220).trim() + "…";
  return snippet;
}

/** Text for rating. */
function getRatingText(reviewCount?: number | null) {
  if (!reviewCount || reviewCount <= 0) return "New activity";
  return `5.0 · ${reviewCount} reviews`;
}

/** INR-style price label. */
function priceLabel(price: unknown, currency?: string | null) {
  if (price == null) return "Price on request";
  const num = typeof price === "string" ? parseFloat(price) : (price as number);
  if (!isFinite(num)) return "Price on request";
  const cur = currency ?? "";
  const val = Intl.NumberFormat("en-IN").format(num);
  return `${cur} ${val}`.trim();
}

/** little UX niceties */
function cleanDestinationLabel(id?: string | null) {
  if (!id) return "destination";
  return id.replace(/-/g, " ");
}

function slugifyTitle(s?: string) {
  if (!s) return "section";
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** pull up to N highlights (prefer "What's Included", else first bullets) */
function getHighlights(
  sections: ReturnType<typeof parseSections>,
  n = 6
): string[] {
  const prefer = sections.find((s) =>
    (s.title || "").toLowerCase().includes("include")
  );
  const pool = prefer?.bullets?.length
    ? prefer.bullets
    : sections.flatMap((s) => s.bullets);
  return pool.slice(0, n);
}

/* ----------------- page component ----------------- */

export async function generateStaticParams() {
  const activities = await getAllActivities();
  return activities.map((activity) => ({
    destinationId: activity.destinationId,
    activitySlug: activity.id,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ destinationId: string; activitySlug: string }>;
}) {
  const { activitySlug } = await props.params;
  const activity = await getActivityById(activitySlug);
  
  if (!activity) {
    return {
      title: "Activity Not Found",
    };
  }

  return {
    title: `${activity.name} - ${cleanDestinationLabel(activity.destinationId)}`,
    description: getHeroSnippetFromSections(parseSections(activity.description)),
  };
}

export default async function ActivityDetailPage(props: {
  params: Promise<{ destinationId: string; activitySlug: string }>;
  searchParams?: Promise<{ tripId?: string }>;
}) {
  const { activitySlug, destinationId } = await props.params;
  const sp = (await props.searchParams) ?? {};
  const tripId = sp.tripId;

  if (!activitySlug) notFound();

  const activity = await getActivityById(activitySlug);
  if (!activity) notFound();

  const sections = parseSections(activity.description);
  const heroSnippet = getHeroSnippetFromSections(sections);
  const destinationLabel = cleanDestinationLabel(activity.destinationId);
  const hasPrice = activity.price != null;

  const highlights = getHighlights(sections, 6);
  const needToKnow =
    sections.find((s) =>
      (s.title || "").toLowerCase().includes("before you go")
    ) ||
    sections.find((s) =>
      (s.title || "").toLowerCase().includes("good to know")
    );

  return (
    <div className="min-h-screen bg-white">
      {/* ===========================
          HERO — split glass panel
      ============================ */}
      <header className="relative">
        <div className="relative h-[64vh] w-full overflow-hidden">
          {activity.imageUrl ? (
            // native img ensures the browser will attempt to fetch the URL
            // even if Next's image config isn't permitting that hostname.
            <img
              src={activity.imageUrl}
              alt={activity.name}
              className="object-cover w-full h-full"
              loading="eager"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                  <div className="text-xs text-gray-400">No Image</div>
                </div>
                <p>No image available</p>
              </div>
            </div>
          )}

          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-black/30 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />

          {/* back button */}
          <Link
            href={`/destinations/${destinationId}`}
            className="absolute left-6 top-6 z-20 rounded-full border border-white/80 bg-white/90 p-3 text-gray-900 backdrop-blur-sm shadow-lg transition-all hover:bg-white"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          {/* glass card */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-6">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-2xl border border-gray-200 bg-white/95 p-6 backdrop-blur-md shadow-2xl">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  {/* left: title + meta */}
                  <div className="max-w-3xl">
                    {/* chips */}
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-700">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="capitalize">{destinationLabel}</span>
                      </span>
                    </div>

                    <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
                      {activity.name}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
                      <span className="font-medium text-gray-900">
                        {getRatingText(activity.reviewCount)}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                      <span className="text-gray-900">
                        {priceLabel(activity.price, activity.currency)}
                        {hasPrice && (
                          <span className="ml-2 text-sm font-normal text-gray-600">
                            per person
                          </span>
                        )}
                      </span>
                    </div>

                    {heroSnippet && (
                      <p className="mt-3 text-sm leading-relaxed text-gray-700">
                        {heroSnippet}
                      </p>
                    )}
                  </div>

                  {/* right: CTA */}
                  <div className="shrink-0">
                    <AddToPlanButton
                      activityId={activity.id}
                      tripRequestId={tripId ?? null}
                      activityName={activity.name}
                      activityImageUrl={activity.imageUrl ?? undefined}
                      destinationId={activity.destinationId}
                      price={activity.price ? parseFloat(activity.price.toString()) : undefined}
                      currency={activity.currency ?? undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===========================
          BODY — highlights + sections + sidebar
      ============================ */}
      <main className="relative bg-white">
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          {/* Highlights grid */}
          {highlights.length > 0 && (
            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Highlights
              </h3>
              <ul className="grid grid-cols-1 gap-3 text-[15px] leading-relaxed text-gray-700 sm:grid-cols-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex gap-3">
                    <Check className="mt-1.5 h-4 w-4 shrink-0 text-gray-900" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* LEFT: Sections (accordion style) */}
            <section className="space-y-4">
              {sections.length > 0 ? (
                sections.map((section, idx) => {
                  const title = section.title || "About this experience";
                  const id = `sec-${slugifyTitle(title)}`;
                  const hasBullets = section.bullets.length > 0;
                  const hasParas = section.paragraphs.length > 0;

                  return (
                    <details
                      key={idx}
                      id={id}
                      className="group rounded-2xl border border-gray-200 bg-white p-0 shadow-sm hover:shadow-md transition-shadow"
                      open={idx < 2} // open first two by default
                    >
                      <summary className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-gray-900 hover:bg-gray-50 transition-colors">
                        <h2 className="text-base font-semibold">{title}</h2>
                        <svg
                          className="h-4 w-4 text-gray-600 transition-transform group-open:rotate-180"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </summary>

                      <div className="px-5 pb-5">
                        {hasParas && (
                          <div className="space-y-4 text-[15px] leading-relaxed text-gray-700">
                            {section.paragraphs.map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        )}

                        {hasBullets && (
                          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-gray-700">
                            {section.bullets.map((b, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="mt-[9px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </details>
                  );
                })
              ) : (
                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-gray-700">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900">
                    About this experience
                  </h2>
                  <p>Details coming soon.</p>
                </article>
              )}
            </section>

            {/* RIGHT: Sticky price dock (sleeker) */}
            <aside className="space-y-6 flex flex-col justify-end">
              <div className="sticky bottom-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">
                  From
                </div>
                <div className="mt-1 text-3xl font-bold text-gray-900">
                  {priceLabel(activity.price, activity.currency)}
                </div>
                {hasPrice && (
                  <div className="text-[11px] text-gray-600">
                    per person (base entry)
                  </div>
                )}

                <div className="mt-4 text-[11px] text-emerald-600">
                  Instant confirmation
                </div>
                <div className="text-[11px] text-gray-600">
                  Weekends / holidays fill fast
                </div>

                <div className="mt-5">
                  <AddToPlanButton
                    activityId={activity.id}
                    tripRequestId={tripId ?? null}
                    activityName={activity.name}
                    activityImageUrl={activity.imageUrl ?? undefined}
                    destinationId={activity.destinationId}
                    price={activity.price ? parseFloat(activity.price.toString()) : undefined}
                    currency={activity.currency ?? undefined}
                  />
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-gray-600">
                  We reserve this for you, bundle it in your custom trip quote,
                  and you decide later. No instant payment here.
                </p>
              </div>

              {/* Need to know (replaces old Quick facts) */}
              {needToKnow &&
                (needToKnow.paragraphs.length > 0 ||
                  needToKnow.bullets.length > 0) && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
                    <h4 className="mb-3 text-sm font-semibold text-gray-900">
                      Need to know
                    </h4>
                    {needToKnow.paragraphs.length > 0 && (
                      <div className="space-y-3 text-xs leading-relaxed text-gray-700">
                        {needToKnow.paragraphs.slice(0, 2).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    )}
                    {needToKnow.bullets.length > 0 && (
                      <ul className="mt-3 space-y-2 text-xs text-gray-700">
                        {needToKnow.bullets.slice(0, 6).map((b, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95 p-3 shadow-lg sm:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="text-sm text-gray-900">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">
              From
            </div>
            <div className="text-lg font-semibold">
              {priceLabel(activity.price, activity.currency)}
            </div>
          </div>
          <div className="min-w-[44%]">
            <AddToPlanButton
              activityId={activity.id}
              tripRequestId={tripId ?? null}
              activityName={activity.name}
              activityImageUrl={activity.imageUrl ?? undefined}
              destinationId={activity.destinationId}
              price={activity.price ? parseFloat(activity.price.toString()) : undefined}
              currency={activity.currency ?? undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
