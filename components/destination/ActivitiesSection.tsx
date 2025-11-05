"use client";

import { motion } from "motion/react";
import { Star, MapPin, Eye, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Activity } from "@/lib/db/schema";
import { useCart } from "@/contexts/CartContext";

interface ActivitiesSectionProps {
  activities: Activity[];
  destinationId: string;
}

export default function ActivitiesSection({
  activities,
  destinationId,
}: ActivitiesSectionProps) {
  const { addActivity, isActivityInCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent, activity: Activity) => {
    e.preventDefault();
    e.stopPropagation();
    
    addActivity({
      id: activity.id,
      name: activity.name,
      imageUrl: activity.imageUrl ?? undefined,
      destinationId: activity.destinationId,
      price: activity.price ? parseFloat(activity.price.toString()) : undefined,
      currency: activity.currency ?? undefined,
      tripRequestId: null,
    });
  };

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <header className="mb-10 max-w-3xl">
          <span className="text-[0.75rem] uppercase tracking-[0.4em] text-gray-500">
            Things to do
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black tracking-tight text-gray-900">
            Popular Activities & Experiences
          </h2>
          <p className="mt-4 text-base text-gray-600 md:text-lg">
            Discover the best things to do at this destination
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Activity Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {activity.imageUrl && (
                  <img
                    src={activity.imageUrl}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                
                {/* Price badge */}
                <div className="absolute top-4 right-4 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-md">
                  <p className="text-sm font-bold text-gray-900">
                    {activity.currency} {activity.price}
                  </p>
                </div>
              </div>

              {/* Activity Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {activity.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {activity.reviewCount && activity.reviewCount > 0 ? (
                    <>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({activity.reviewCount} reviews)
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 italic">
                      New activity
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {activity.description}
                </p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleAddToCart(e, activity)}
                    disabled={isActivityInCart(activity.id)}
                    className={`flex-1 rounded-xl border py-2.5 px-3 text-center text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isActivityInCart(activity.id)
                        ? "border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                        : "border-gray-900 bg-white text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isActivityInCart(activity.id) ? "In Cart" : "Add"}
                  </button>
                  
                  <Link
                    href={`/destinations/${destinationId}/activities/${activity.id}`}
                    className="flex-1 rounded-xl border border-gray-900 bg-gray-900 py-2.5 px-3 text-center text-sm font-semibold text-white transition-all hover:bg-gray-800 flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">
              Activities coming soon for this destination
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
