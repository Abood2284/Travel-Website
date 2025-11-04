"use client";

import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, X, Trash2 } from 'lucide-react';

export default function CartDrawer() {
  const { activities, removeActivity, clearCart, itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if cart should be visible on current page
  const isCartVisible = () => {
    if (!pathname) return false;
    // Show cart only on destination pages and trip-builder
    return pathname.includes('/destinations/') || pathname.includes('/trip-builder');
  };

  const priceLabel = (price: number | undefined, currency: string | undefined) => {
    if (price == null) return "Price on request";
    const cur = currency ?? "";
    const val = Intl.NumberFormat("en-IN").format(price);
    return `${cur} ${val}`.trim();
  };

  const handleProceedToCheckout = () => {
    setIsOpen(false);
    router.push('/trip-builder');
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Don't render cart if not on allowed pages
  if (!isCartVisible()) {
    return null;
  }

  return (
    <>
      {/* Cart Button - Fixed bottom right with white/black theme */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-gray-900 shadow-lg backdrop-blur-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-xl"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="text-sm font-medium">Cart</span>
        {itemCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Drawer Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Your Trip Plan</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {itemCount} activit{itemCount !== 1 ? 'ies' : 'y'} selected
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="Close cart"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {activities.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-6">
                      <ShoppingCart className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">Your cart is empty</p>
                    <p className="text-sm text-gray-500">Add activities to start planning your trip</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          {/* Activity Image */}
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                            {activity.imageUrl ? (
                              <Image
                                src={activity.imageUrl}
                                alt={activity.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Activity Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                              {activity.name}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize mb-2">
                              {activity.destinationId.replace(/-/g, ' ')}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {priceLabel(activity.price, activity.currency)}
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeActivity(activity.id)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors self-start"
                            aria-label="Remove activity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {activities.length > 0 && (
                <div className="border-t border-gray-200 p-6 space-y-3 bg-gray-50">
                  <button
                    onClick={() => clearCart()}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800 transition-colors shadow-md"
                  >
                    Proceed to Trip Builder
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Review and customize your trip details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
