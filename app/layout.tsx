// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { firaSans, manrope } from "@/public/fonts/font";
import { SoundProvider } from "@/sfx/SoundProvider";
import SoundToggleFloating from "@/sfx/SoundToggleFloating";
import { Toaster } from "@/components/ui/sonner";
import SiteHeader from "@/components/site-header/SiteHeader";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import CartNotification from "@/components/cart/CartNotification";
import CartRefreshListener from "@/components/cart/CartRefreshListener";

export const metadata: Metadata = {
  title: "Scroll Animation Demo",
  description: "Scroll-triggered Lottie animation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${manrope.variable} ${firaSans.variable} overflow-x-hidden`}
      >
        <CartProvider>
          <SoundProvider>
            {/* <SiteHeader /> */}
            {children}
            <SoundToggleFloating />
            <Toaster richColors closeButton />
            <CartDrawer />
            <CartNotification />
            <CartRefreshListener />
          </SoundProvider>
        </CartProvider>
      </body>
    </html>
  );
}
