import "./globals.css";
import type { Metadata } from "next";
import { firaSans, manrope } from "@/public/fonts/font";
import { SoundProvider } from "@/sfx/SoundProvider";
import SoundToggleFloating from "@/sfx/SoundToggleFloating";
import { Toaster } from "@/components/ui/sonner";
import SiteHeader from "@/components/site-header/SiteHeader";

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
      <body className={`${manrope.variable} ${firaSans.variable} overflow-x-hidden`}>
        <SoundProvider>
          <SiteHeader />
          {children}
          <SoundToggleFloating />
          <Toaster richColors closeButton />
        </SoundProvider>
      </body>
    </html>
  );
}
