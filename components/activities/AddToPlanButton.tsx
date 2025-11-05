"use client";

import * as React from "react";
import { useCart } from "@/contexts/CartContext";

type AddToPlanButtonProps = {
  activityId: string;
  tripRequestId: string | null;
  activityName?: string;
  activityImageUrl?: string;
  destinationId?: string;
  price?: number;
  currency?: string;
  defaultAdded?: boolean;
  onAdded?: () => void;
};

export function AddToPlanButton({ 
  activityId, 
  tripRequestId,
  activityName = "Activity",
  activityImageUrl,
  destinationId = "unknown",
  price,
  currency,
  defaultAdded, 
  onAdded 
}: AddToPlanButtonProps) {
  const { addActivity, isActivityInCart } = useCart();
  const [status, setStatus] = React.useState<"idle" | "adding" | "added">("idle");

  const inCart = isActivityInCart(activityId);

  React.useEffect(() => {
    if (defaultAdded) {
      setStatus("added");
    }
  }, [defaultAdded]);

  const handleClick = React.useCallback(() => {
    if (status === "adding" || inCart) return;

    setStatus("adding");

    // Add to cart
    addActivity({
      id: activityId,
      name: activityName,
      imageUrl: activityImageUrl,
      destinationId,
      price,
      currency,
      tripRequestId,
    });

    setStatus("added");
    setTimeout(() => setStatus("idle"), 2000);
    onAdded?.();
  }, [activityId, activityName, activityImageUrl, destinationId, price, currency, tripRequestId, status, inCart, addActivity, onAdded]);

  const label =
    status === "adding" ? "Adding…" :
    status === "added" ? "Added!" :
    inCart ? "In Cart" : "Add to Cart";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "adding" || inCart}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/60 focus-visible:ring-offset-2 ${
        inCart
          ? "bg-gray-100 text-gray-900 border border-gray-300 cursor-default"
          : "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
      }`}
    >
      {label}
    </button>
  );
}
