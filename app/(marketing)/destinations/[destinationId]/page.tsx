// app/(marketing)/destinations/[destinationId]/page.tsx
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/lib/db/client";
import { activities } from "@/lib/db/schema";
import { DESTINATIONS } from "@/lib/const";
import { DESTINATION_DATA } from "@/lib/destination-data";
import DestinationHero from "@/components/destination/DestinationHero";
import DestinationInfo from "@/components/destination/DestinationInfo";
import DestinationHighlights from "@/components/destination/DestinationHighlights";
import SuitedForSection from "@/components/destination/SuitedForSection";
import ActivitiesSection from "@/components/destination/ActivitiesSection";
import SiteFooter from "@/components/site-footer/SiteFooter";

interface PageProps {
  params: Promise<{ destinationId: string }>;
}

export async function generateStaticParams() {
  return DESTINATIONS.map((destination) => ({
    destinationId: destination.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { destinationId } = await params;
  const destinationInfo = DESTINATION_DATA[destinationId];
  
  if (!destinationInfo) {
    return {
      title: "Destination Not Found",
    };
  }

  return {
    title: `${destinationInfo.name}, ${destinationInfo.country} - Travel Destination`,
    description: destinationInfo.description,
    openGraph: {
      title: `Explore ${destinationInfo.name}, ${destinationInfo.country}`,
      description: destinationInfo.description,
      images: [destinationInfo.heroImage],
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { destinationId } = await params;

  // Validate destination exists
  const destination = DESTINATIONS.find((d) => d.id === destinationId);
  if (!destination) {
    notFound();
  }

  const destinationInfo = DESTINATION_DATA[destinationId];
  if (!destinationInfo) {
    notFound();
  }

  // Fetch activities from database
  let destinationActivities: typeof activities.$inferSelect[] = [];
  try {
    destinationActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.destinationId, destinationId));
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    // Continue without activities rather than failing the page
  }

  return (
    <div className="min-h-screen bg-white">
      <DestinationHero
        name={destinationInfo.name}
        country={destinationInfo.country}
        description={destinationInfo.description}
        heroImage={destinationInfo.heroImage}
      />

      <div className="relative isolate overflow-hidden bg-white">
        <div className="relative mx-auto max-w-7xl px-4 py-20 space-y-20 md:py-24 md:space-y-24">
          <DestinationInfo
            highlights={destinationInfo.highlights}
            bestTimeToVisit={destinationInfo.bestTimeToVisit}
            currency={destinationInfo.currency}
            language={destinationInfo.language}
          />

          <DestinationHighlights
            highlights={destinationInfo.destinationHighlights}
          />

          <SuitedForSection suitedFor={destinationInfo.suitedFor} />

          {destinationActivities.length > 0 && (
            <ActivitiesSection 
              activities={destinationActivities} 
              destinationId={destinationId}
            />
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
