"use client";

import * as React from "react";
import clsx from "clsx";
import { gsap } from "gsap";

export type FAQItem = {
  id: string;
  q: string;
  a: string;
  tags: string[];
};

type Props = {
  items: FAQItem[];
  title?: string;
  description?: string;
  className?: string;
  enableHashDeepLink?: boolean;
};

const DEFAULT_TITLE = "Smart FAQ";
const DEFAULT_DESC = "Search, filter, deep link. Press / to focus search.";

export default function SmartFAQSection({
  items,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  className,
  enableHashDeepLink = true,
}: Props) {
  const [query, setQuery] = React.useState("");
  const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set());
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const searchRef = React.useRef<HTMLInputElement>(null);

  const allTags = React.useMemo(
    () => Array.from(new Set(items.flatMap((i) => i.tags))).sort(),
    [items]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const tagActive = activeTags.size > 0;
    return items.filter((it) => {
      const tagPass = tagActive ? it.tags.some((t) => activeTags.has(t)) : true;
      const text = (it.q + " " + it.a).toLowerCase();
      const qPass = q ? text.includes(q) : true;
      return tagPass && qPass;
    });
  }, [items, query, activeTags]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!enableHashDeepLink) return;
    const openFromHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      setExpanded((prev) => new Set(prev).add(id));
      requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    openFromHash();
    const onHash = () => openFromHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [enableHashDeepLink]);

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpanded((prev) => {
      const next = new Set(prev);
      filtered.forEach((it) => next.add(it.id));
      return next;
    });
  }

  function collapseAll() {
    setExpanded((prev) => {
      const next = new Set(prev);
      filtered.forEach((it) => next.delete(it.id));
      return next;
    });
  }

  return (
    <section
      id="smart-faq"
      className={clsx(
        "relative isolate overflow-hidden bg-[#050505] py-20 text-white md:py-24",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 animate-[glowPulse_16s_ease-in-out_infinite] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),rgba(5,5,5,0)_65%)] opacity-80" />
      <div
        className="pointer-events-none absolute inset-0 animate-[glowPulseReverse_16s_ease-in-out_infinite] bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.16),rgba(5,5,5,0)_65%)] opacity-70"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 -bottom-40 flex justify-center">
        <div className="h-44 w-[min(1100px,_120%)] rounded-full bg-white/15 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-3xl space-y-4">
          <span className="text-[0.75rem] uppercase tracking-[0.4em] text-white/60">
            Answers, on tap
          </span>
          <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] font-black tracking-tight text-white">
            {title}
          </h2>
          {description && (
            <p className="text-base text-white/70 md:text-lg">{description}</p>
          )}
        </header>

        <div className="rounded-[32px] border border-white/12 bg-white/5 p-5 shadow-[0_40px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1">
              <input
                ref={searchRef}
                id="faq-search"
                placeholder="Search questions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/55 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/25"
              />
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                <path d="M20 20l-3.2-3.2" strokeWidth="1.8" />
              </svg>
            </div>
            <div className="ml-auto hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={expandAll}
                className="h-10 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="h-10 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
              >
                Collapse all
              </button>
            </div>
          </div>

          <div className="mt-4 hidden gap-2 md:flex md:flex-wrap">
            {allTags.map((tag) => {
              const on = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={clsx(
                    "h-9 rounded-full border px-3 text-sm transition",
                    on
                      ? "border-white bg-white text-[#050505]"
                      : "border-white/15 text-white/75 hover:border-white/35 hover:bg-white/10 hover:text-white"
                  )}
                  aria-pressed={on}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-sm text-white/60">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>

          <ul className="mt-6 divide-y divide-white/10">
            {filtered.map((item) => {
              const open = expanded.has(item.id);
              return (
                <FAQItemRow
                  key={item.id}
                  item={item}
                  open={open}
                  onToggle={() => toggle(item.id)}
                  query={query}
                />
              );
            })}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .faq-highlight {
          background: rgba(255, 255, 255, 0.16);
          color: inherit;
          border-radius: 4px;
          padding: 0 0.2em;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}

type FAQItemRowProps = {
  item: FAQItem;
  open: boolean;
  onToggle: () => void;
  query: string;
};

const FAQItemRow = React.memo(function FAQItemRow({
  item,
  open,
  onToggle,
  query,
}: FAQItemRowProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const mountedRef = React.useRef(false);

  const questionNodes = React.useMemo(
    () => renderHighlightedText(item.q, query, { prefix: `${item.id}-q` }),
    [item.q, query, item.id]
  );

  const previewText = React.useMemo(() => firstSentence(item.a), [item.a]);
  const previewNodes = React.useMemo(
    () =>
      renderHighlightedText(previewText, query, {
        prefix: `${item.id}-preview`,
      }),
    [previewText, query, item.id]
  );

  const answerNodes = React.useMemo(
    () =>
      renderHighlightedText(item.a, query, {
        prefix: `${item.id}-answer`,
        wrapWords: true,
      }),
    [item.a, query, item.id]
  );

  React.useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      gsap.set(panel, { height: 0, overflow: "hidden" });
      return;
    }

    gsap.killTweensOf(panel);

    if (open) {
      const targetHeight = content.offsetHeight;
      gsap.set(panel, { height: 0, overflow: "hidden" });
      gsap.to(panel, {
        height: targetHeight,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(panel, { height: "auto" });
        },
      });

      const words = Array.from(
        content.querySelectorAll<HTMLElement>("[data-word]")
      );
      if (words.length > 0) {
        gsap.set(words, { opacity: 0, yPercent: 35 });
        gsap.to(words, {
          opacity: 1,
          yPercent: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.04,
          delay: 0.05,
          clearProps: "opacity,transform",
        });
      }
    } else {
      const currentHeight = panel.scrollHeight;
      if (currentHeight === 0) {
        gsap.set(panel, { height: 0, overflow: "hidden" });
        return;
      }
      gsap.set(panel, { height: currentHeight, overflow: "hidden" });
      gsap.to(panel, {
        height: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
    }
  }, [open, query]);

  const panelId = `${item.id}-panel`;

  return (
    <li
      id={item.id}
      className={clsx(
        "border-l-[3px] border-transparent px-3 py-4 transition-colors",
        open && "border-l-white/80 bg-white/10"
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="group flex w-full items-start justify-between gap-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
            <span>{item.tags[0] || "General"}</span>
            {item.tags.length > 1 && (
              <span className="hidden md:inline text-white/40">
                {item.tags.slice(1).join(" / ")}
              </span>
            )}
          </div>

          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white transition group-hover:text-white/90 md:text-xl break-words whitespace-normal">
            {questionNodes}
          </h3>

          {!open && (
            <p className="mt-2 line-clamp-2 text-sm text-white/65 md:text-[15px] break-words whitespace-normal">
              {previewNodes}
            </p>
          )}
        </div>

        <svg
          className={clsx(
            "mt-1 h-5 w-5 shrink-0 text-white/60 transition-transform",
            open ? "rotate-180" : "rotate-0"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeWidth="1.8" />
        </svg>
      </button>

      <div
        id={panelId}
        ref={panelRef}
        className="faq-panel mt-1 overflow-hidden"
        aria-hidden={!open}
      >
        <div ref={contentRef} className="pt-4">
          <div className="max-w-prose text-[15px] leading-7 text-white/70 break-words whitespace-normal">
            {answerNodes}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {item.tags.map((t) => (
              <span
                key={t}
                className="inline-block rounded-full border border-white/15 px-2 py-0.5 text-[11px] font-medium text-white/60"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
});

FAQItemRow.displayName = "FAQItemRow";

type HighlightOptions = {
  prefix: string;
  wrapWords?: boolean;
};

type Segment = {
  text: string;
  highlight: boolean;
};

function renderHighlightedText(
  text: string,
  query: string,
  options: HighlightOptions
): React.ReactNode[] {
  const segments = buildSegments(text, query);
  return segments.flatMap((segment, segmentIndex) =>
    wrapSegment(segment, options, segmentIndex)
  );
}

function buildSegments(text: string, query: string): Segment[] {
  const q = query.trim();
  if (!q) {
    return [{ text, highlight: false }];
  }

  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const segments: Segment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = lower.indexOf(needle, cursor);
    if (matchIndex === -1) {
      segments.push({ text: text.slice(cursor), highlight: false });
      break;
    }

    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), highlight: false });
    }

    segments.push({
      text: text.slice(matchIndex, matchIndex + q.length),
      highlight: true,
    });

    cursor = matchIndex + q.length;
  }

  return segments;
}

function wrapSegment(
  segment: Segment,
  { wrapWords = false, prefix }: HighlightOptions,
  segmentIndex: number
): React.ReactNode[] {
  if (!segment.text) return [];
  const parts = segment.text.split(/(\s+)/);

  return parts.map((part, partIndex) => {
    if (!part) return null;
    const key = `${prefix}-${segmentIndex}-${partIndex}`;

    if (/^\s+$/.test(part)) {
      return (
        <span key={key} className="whitespace-pre">
          {part}
        </span>
      );
    }

    const highlightClass = segment.highlight ? "faq-highlight" : undefined;

    if (wrapWords) {
      return (
        <span key={key} data-word className="inline-block">
          <span className={highlightClass}>{part}</span>
        </span>
      );
    }

    return (
      <span key={key} className={highlightClass}>
        {part}
      </span>
    );
  });
}

function firstSentence(text: string): string {
  const idx = text.indexOf(". ");
  return idx >= 0 ? text.slice(0, idx + 1) : text;
}
