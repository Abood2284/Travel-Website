// app/page.tsx
import { ScrollAnimation } from "@/components/scroll-animation/scroll-animation";
import { TravelSearchSection } from "@/components/travel-search-section/travel-search-section";
import { ContinentExplorer } from "@/components/continent-explorer/continent-explorer";

import TripBuilderSection from "@/components/trip-builder/TripBuilderSection";
import BoardingPass from "@/components/trip-builder/BoardingPass";

export default function HomePage() {
  return (
    <main>
      <ScrollAnimation
        animationPath="/animations/data.json"
        pxPerFrame={24}
        scrubAmount={1}
      />
      {/* <NextSection /> */}

      <TripBuilderSection />

      {/* <HowItWorksWave
        steps={[
          {
            title: "Book the form",
            note: "Share dates, people count, and basics.",
          },
          {
            title: "We craft your plan",
            note: "Itinerary + airline/room preferences.",
          },
          {
            title: "Concierge call",
            note: "Human reviews, tweaks, and confirms.",
          },
          {
            title: "Pay invoice",
            note: "Use your reference to complete payment.",
          },
        ]}
        heightVh={72}
        topOffsetVh={10}
      /> */}

      <TravelSearchSection />
      <ContinentExplorer />
    </main>
  );
}
