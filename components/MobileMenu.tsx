"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import type {
  StaggeredMenuItem,
  StaggeredMenuSocialItem,
} from "@/components/StaggeredMenu";

// Do NOT SSR the GSAP-based menu.
const StaggeredMenu = dynamic(() => import("@/components/StaggeredMenu"), {
  ssr: false,
});

export default function MobileMenu() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mirror your desktop links
  const items: StaggeredMenuItem[] = [
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "Pay invoice", ariaLabel: "Pay invoice", link: "/pay-invoice" },
    { label: "Projects", ariaLabel: "See our work", link: "/projects" },
    { label: "Process", ariaLabel: "See our process", link: "#process" },
    { label: "Solutions", ariaLabel: "See solutions", link: "/solutions" },
    { label: "Company", ariaLabel: "About us", link: "/about-us" },
  ];

  const socialItems: StaggeredMenuSocialItem[] = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  const lockScroll = useCallback(() => {
    const el = document.documentElement;
    el.style.overflowY = "hidden";
    el.style.height = "100%";
  }, []);

  const unlockScroll = useCallback(() => {
    const el = document.documentElement;
    el.style.overflowY = "";
    el.style.height = "";
  }, []);

  // Programmatically close the menu by clicking its toggle if open
  const closeMenuProgrammatically = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const wrapper = root.querySelector(
      ".staggered-menu-wrapper[data-open]"
    ) as HTMLElement | null;
    if (!wrapper) return;
    const toggle = wrapper.querySelector<HTMLButtonElement>(".sm-toggle");
    // tiny delay so navigation happens first (hash jump / route change)
    setTimeout(() => toggle?.click(), 120);
  }, []);

  // Delegate clicks on panel links to close the menu AFTER navigation
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const anchor = t.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      // Only react to clicks inside the ReactBits panel
      const insidePanel = !!anchor.closest("#staggered-menu-panel");
      if (!insidePanel) return;

      // Let the browser navigate, then close the menu
      closeMenuProgrammatically();
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [closeMenuProgrammatically]);

  return (
    <div
      ref={containerRef}
      className="lw-mobilenav fixed inset-0 z-[100] pointer-events-none"
    >
      <StaggeredMenu
        className="pointer-events-auto"
        position="right"
        panelTheme="dark"
        items={items}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        // Brand colors
        colors={["#F4C3C2", "#111111"]}
        accentColor="#F4C3C2"
        // Toggle color over your light header
        menuButtonColor="#ffffff"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen={true}
        // Replace logo with text
        logoText="LeafWay Admin Panel"
        onMenuOpen={lockScroll}
        onMenuClose={unlockScroll}
      />
      {/* Mobile overlay brand: only visible when the menu is open */}
      <div
        aria-hidden
        className="lw-mobile-brand pointer-events-none select-none"
      >
        <span className="font-display">LeafWay Tech</span>
      </div>
    </div>
  );
}
