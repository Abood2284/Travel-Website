// components/site-footer/SiteFooter.tsx
import Link from "next/link";

const navGroups: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Trip Builder Lite", href: "/#trip-builder" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Travel Search", href: "/#travel-search" },
      { label: "Have an Invoice?", href: "/#invoice" },
    ],
  },
  {
    title: "Destinations",
    links: [
      { label: "Activities Library", href: "/activities" },
      { label: "Continent Explorer", href: "/#continent-explorer" },
    ],
  },
  {
    title: "Support",
    links: [
      {
        label: "Email the Team",
        href: "mailto:hello@tripbuilder.studio",
        external: true,
      },
      {
        label: "WhatsApp Concierge",
        href: "https://wa.me/971555000000",
        external: true,
      },
      { label: "Call Support", href: "tel:+971555000000", external: true },
    ],
  },
];

const socials: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://instagram.com/tripbuilderstudio" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/tripbuilderstudio",
  },
  { label: "YouTube", href: "https://www.youtube.com/tripbuilderstudio" },
];

const legalLinks: { label: string; href: string }[] = [
  { label: "Privacy", href: "/#privacy" },
  { label: "Terms", href: "/#terms" },
  { label: "Accessibility", href: "/#accessibility" },
];

const officeAddressLines = [
  "Meydan Grandstand, 6th floor",
  "Meydan Road, Nad Al Sheba",
  "Dubai, U.A.E.",
];

const mapsQuery = encodeURIComponent(
  "Meydan Grandstand, 6th floor, Meydan Road, Nad Al Sheba, Dubai, U.A.E."
);
const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
const appleMapsUrl = `https://maps.apple.com/?q=${mapsQuery}`;

const currentYear = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-black/10 bg-[#050505] text-white">
      {/* background glow — server-safe (no styled-jsx) */}
      <div
        className="pointer-events-none absolute inset-0 animate-pulse [animation-duration:16s] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 -top-28 flex justify-center"
        aria-hidden
      >
        <div className="h-32 w-[min(90vw,900px)] rounded-full bg-white/20 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Brand + pitch */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/65">
              LeafWay Travel
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[44px]">
              Plan trips with clarity. Book with confidence.
            </h2>
            <p className="max-w-xl text-sm text-white/70 sm:text-base">
              Trip Builder Lite captures your basics in minutes, our specialists
              refine the plan, and you approve one clean quote. Visas, vouchers,
              vendors—handled quietly so your memories stay loud.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/#trip-builder"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Open Trip Builder
              </Link>
              <a
                href="mailto:hello@tripbuilder.studio"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:text-white/90"
              >
                Talk to a specialist
              </a>
            </div>
          </div>

          {/* Right column: nav + cards */}
          <div className="grid gap-10">
            {/* Mobile: 2 columns — Product | Destinations + Support */}
            <div className="grid grid-cols-2 gap-8 sm:hidden">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                  {navGroups[0].title}
                </h3>
                <ul className="space-y-2 text-sm">
                  {navGroups[0].links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-white/70 transition hover:text-white"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="inline-flex items-center text-white/70 transition hover:text-white"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                {[navGroups[1], navGroups[2]].map((group) => (
                  <div key={group.title} className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                      {group.title}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          {link.external ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-white/70 transition hover:text-white"
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="inline-flex items-center text-white/70 transition hover:text-white"
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* sm+: original 3-column layout */}
            <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                    {group.title}
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-white/70 transition hover:text-white"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="inline-flex items-center text-white/70 transition hover:text-white"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CARDS ROW: side-by-side on md+ */}
            <div className="grid grid-cols-1 gap-6 md:max-w-[720px] md:mx-auto">
              {/* Visit us */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <img
                  src="/globe.svg"
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 opacity-10"
                />
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                    Visit our studio
                  </h3>

                  <div className="grid items-start gap-4 md:grid-cols-[1fr_auto]">8
                    {/* Address + hours */}
                    <div className="space-y-3">
                      <address className="not-italic text-sm leading-relaxed text-white/80">
                        {officeAddressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                      <p className="text-xs text-white/60">
                        Hours: Sun–Thu · 10:00–18:00 GST
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 sm:justify-start">
                      <a
                        href={googleMapsPlaceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center whitespace-nowrap rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                        aria-label="View on Google Maps"
                      >
                        View on Maps
                      </a>
                      <a
                        href={googleMapsDirectionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center whitespace-nowrap rounded-2xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white"
                        aria-label="Get directions"
                      >
                        Directions
                      </a>
                      <a
                        href={appleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center whitespace-nowrap rounded-2xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white"
                        aria-label="Open in Apple Maps"
                      >
                        Apple Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                  Stay in touch
                </h3>
                <p className="mt-3 text-sm text-white/70">
                  One monthly email with new city guides, visa changes, and the
                  tools we’re prototyping next.
                </p>
                <form className="mt-5 flex flex-col gap-3 md:flex-row">
                  <label htmlFor="footer-newsletter" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="footer-newsletter"
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    required
                  />
                  <button
                    type="submit"
                    className="h-11 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="mt-2 text-[11px] text-white/45">
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} LeafWay Travel. Crafted on international waters.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 transition hover:border-white hover:text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
