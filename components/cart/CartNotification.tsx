"use client";

import { useCart } from '@/contexts/CartContext';
import { useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function CartNotification() {
  const { showNotification, setShowNotification } = useCart();

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification, setShowNotification]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xl max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-900">
            <Check className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">Activity added!</p>
            <p className="text-sm text-gray-600 mt-0.5">Check your cart to review activities</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
