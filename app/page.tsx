// app/page.tsx
import { Suspense } from "react";
import { ScrollAnimation } from "@/components/scroll-animation/scroll-animation";
import { TravelSearchSection } from "@/components/travel-search-section/travel-search-section";
import { ContinentExplorer } from "@/components/continent-explorer/continent-explorer";

import TripBuilderSection from "@/components/trip-builder/TripBuilderSection";
import SiteFooter from "@/components/site-footer/SiteFooter";
import HowItWorks from "@/components/how-it-works/HowItWorks";
import HaveInvoiceSection from "@/components/invoice/HaveInvoiceSection";
import SmartFAQSection, { FAQItem } from "@/components/faq/SmartFaqSection";

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "quotes-flow",
    q: "How does the booking/quotation flow work?",
    a: "You submit your trip details; our team calls to refine the plan; we send a formal quotation with an invoice reference. If you’re in the UAE you can pay via our domestic gateway; otherwise you’ll receive a secure invoice link.",
    tags: ["Booking", "Quotes"],
  },
  {
    id: "tripbuilder-what",
    q: "What is Trip Builder Lite?",
    a: "A guided, one-question-at-a-time flow inspired by Typeform. You answer a few curated prompts and get a clear summary plus a stylized boarding-pass preview before submitting.",
    tags: ["Trip Builder"],
  },
  {
    id: "invoice-pay",
    q: "How do I pay an invoice?",
    a: "Use the Have an Invoice section. Enter your reference to be redirected to the payment page. UAE payments go through our domestic gateway; others may pay via the secure invoice link we issue.",
    tags: ["Payments", "Invoices"],
  },
  // ...add the rest
];

export default function HomePage() {
  return (
    <main>
      <ScrollAnimation
        animationPath="/animations/data.json"
        pxPerFrame={24}
        scrubAmount={1}
      />
      <TripBuilderSection />
      {/* Here’s the new section */}
      <HowItWorks />
      <Suspense fallback={null}>
        <HaveInvoiceSection />
      </Suspense>
      <SmartFAQSection items={FAQ_ITEMS} />

      <SiteFooter />
    </main>
  );
}
