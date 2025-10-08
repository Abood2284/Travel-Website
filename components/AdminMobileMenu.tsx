"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import type {
  StaggeredMenuItem,
  StaggeredMenuSocialItem,
} from "@/components/StaggeredMenu";

// No SSR for GSAP menu
const StaggeredMenu = dynamic(() => import("@/components/StaggeredMenu"), {
  ssr: false,
});

export default function AdminMobileMenu() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const items: StaggeredMenuItem[] = [
    {
      label: "Add Destination",
      ariaLabel: "Add Destination",
      link: "/leafway/solutions/admin/destinations/new",
    },
    {
      label: "Update Destination",
      ariaLabel: "Update Destination",
      link: "/leafway/solutions/admin/destinations",
    },
    {
      label: "Add Invoice",
      ariaLabel: "Add Invoice",
      link: "/leafway/solutions/admin/invoices/new",
    },
    {
      label: "View Invoices",
      ariaLabel: "View Invoices",
      link: "/leafway/solutions/admin/invoices",
    },
    {
      label: "Trip Requests",
      ariaLabel: "View Trip Requests",
      link: "/leafway/solutions/admin/trip-requests",
    },
    {
      label: "Dashboard",
      ariaLabel: "Admin Dashboard",
      link: "/leafway/solutions/admin",
    },
  ];

  const socialItems: StaggeredMenuSocialItem[] = [];

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

  const closeMenuProgrammatically = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const wrapper = root.querySelector(
      ".staggered-menu-wrapper[data-open]"
    ) as HTMLElement | null;
    if (!wrapper) return;
    const toggle = wrapper.querySelector<HTMLButtonElement>(".sm-toggle");
    setTimeout(() => toggle?.click(), 120);
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const anchor = t.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const insidePanel = !!anchor.closest("#staggered-menu-panel");
      if (!insidePanel) return;
      closeMenuProgrammatically();
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [closeMenuProgrammatically]);

  return (
    <div
      ref={containerRef}
      className="lw-mobilenav lw-admin-mobilenav fixed inset-0 z-[100] pointer-events-none"
    >
      <StaggeredMenu
        className="pointer-events-auto"
        position="right"
        panelTheme="dark"
        itemFontSize="clamp(1.25rem,3.8vw,2rem)"
        items={items}
        socialItems={socialItems}
        displaySocials={false}
        displayItemNumbering={true}
        colors={["#0b0b0b", "#111111"]}
        accentColor="#F4C3C2"
        menuButtonColor="#ffffff"
        openMenuButtonColor="#000000"
        changeMenuColorOnOpen={true}
        logoText="LeafWay Admin Panel"
        onMenuOpen={lockScroll}
        onMenuClose={unlockScroll}
      />
    </div>
  );
}
