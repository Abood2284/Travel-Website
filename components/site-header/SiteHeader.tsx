"use client";

import Link from "next/link";
import { Building2, Plane } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";

const NAV_LINKS = [
  { href: "#destinations", label: "Destinations" },
  { href: "#experiences", label: "Experiences" },
  { href: "#blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

const SiteHeader = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="relative flex w-full items-center px-4 py-4 text-white md:px-8 md:py-6">
        <Link
          href="/"
          className="text-base sm:text-lg font-semibold uppercase tracking-[0.15em] sm:tracking-[0.25em] text-white drop-shadow-md"
        >
          LeafWay Solutions
        </Link>

        <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/30 bg-white/10 px-6 py-3 shadow-lg backdrop-blur-md">
            <Plane className="h-5 w-5" aria-hidden="true" />
            <span className="h-6 w-px bg-white/50" aria-hidden="true" />
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {/* Desktop nav */}
        <div className="ml-auto hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-[0.2em]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:text-white/80"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          className="ml-auto md:hidden text-sm font-semibold uppercase tracking-[0.2em] hover:text-white/80"
          onClick={() => {
            const btn = document.querySelector<HTMLButtonElement>(
              ".staggered-menu-wrapper .sm-toggle"
            );
            btn?.click();
          }}
          aria-label="Open menu"
        >
          Menu
        </button>

        {/* Mobile menu overlay */}
        <MobileMenu />
      </nav>
    </header>
  );
};

export default SiteHeader;
