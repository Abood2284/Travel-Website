// app/layout.tsx
import "@/app/globals.css";
import type { Metadata } from "next";
import { firaSans, manrope } from "@/public/fonts/font";
import { Toaster } from "@/components/ui/sonner";
import AdminMobileMenu from "@/components/AdminMobileMenu";

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
        className={`${manrope.variable} ${firaSans.variable} overflow-x-hidden`}
      >
        <AdminMobileMenu />
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
