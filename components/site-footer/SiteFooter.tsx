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

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-black/10 bg-[#050505] text-white">
      <div
        className="absolute inset-0 animate-[glowPulse_16s_ease-in-out_infinite] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_65%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 -top-28 flex justify-center"
        aria-hidden
      >
        <div className="h-32 w-[min(90vw,900px)] rounded-full bg-white/20 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/65">
              LeafWay Solutions
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[44px]">
              Design your itinerary in monochrome calm.
            </h2>
            <p className="max-w-xl text-sm text-white/70 sm:text-base">
              From the first spark to the final boarding pass, our specialists
              shape your travel with understated precision. We keep the palette
              quiet so the memories stay vivid.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/#trip-builder"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Plan a trip
              </Link>
              <a
                href="mailto:hello@leafway.solution"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:text-white/90"
              >
                Talk to a specialist
              </a>
            </div>
          </div>

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

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                Stay in touch
              </h3>
              <p className="mt-3 text-sm text-white/70">
                A once-a-month dispatch with new city guides, visa shifts, and
                the tools we’re prototyping next.
              </p>
              <form className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label htmlFor="footer-newsletter" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-newsletter"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
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
                No noise—unsubscribe with one tap.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} LeafWay Solutions. Crafted on International
              waters.
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

export default SiteFooter;
