"use client";

import * as React from "react";
import { toast } from "sonner";

type AddToPlanButtonProps = {
  activityId: string;
  tripRequestId: string | null;
  defaultAdded?: boolean;
  onAdded?: () => void;
};

export function AddToPlanButton({ activityId, tripRequestId, defaultAdded, onAdded }: AddToPlanButtonProps) {
  const [isPending, startTransition] = React.useTransition();
  const [hasAdded, setHasAdded] = React.useState(Boolean(defaultAdded));

  React.useEffect(() => {
    setHasAdded(Boolean(defaultAdded));
  }, [defaultAdded]);

  const disabled = !tripRequestId || isPending || hasAdded;

  const handleClick = React.useCallback(() => {
    if (!tripRequestId) {
      toast.info("Save your trip first, then add activities.");
      return;
    }
    if (hasAdded) return;

    startTransition(async () => {
      const promise = fetch(`/api/trip-requests/${tripRequestId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId }),
      });

      toast.promise(promise, {
        loading: "Adding to plan…",
        success: "Activity added to your plan",
        error: "Failed to add activity. Try again.",
      });

      try {
        const response = await promise;
        if (!response.ok) {
          throw new Error("Failed request");
        }
        setHasAdded(true);
        onAdded?.();
      } catch (error) {
        console.error("Add to plan failed", error);
      }
    });
  }, [activityId, tripRequestId, hasAdded, onAdded]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/60 focus-visible:ring-offset-2 ${
        disabled
          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
          : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {hasAdded ? "Activity added" : isPending ? "Adding…" : "Add to plan"}
    </button>
  );
}
