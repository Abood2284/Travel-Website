// app/page.tsx
import { ScrollAnimation } from "@/components/scroll-animation/scroll-animation";
import { TravelSearchSection } from "@/components/travel-search-section/travel-search-section";
import { ContinentExplorer } from "@/components/continent-explorer/continent-explorer";

import TripBuilderSection from "@/components/trip-builder/TripBuilderSection";
import HowItWorks from "@/components/how-it-works/HowItWorks";


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

      <TravelSearchSection />
      <ContinentExplorer />
    </main>
  );
}
