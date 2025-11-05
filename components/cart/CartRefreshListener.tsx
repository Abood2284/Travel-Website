"use client";

import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { usePathname } from 'next/navigation';

/**
 * Component that manages cart lifecycle:
 * 1. Refreshes cart when navigating to destination or trip-builder pages
 * 2. Clears cart when navigating to homepage
 * 3. Refreshes cart on window focus (when allowed pages are active)
 */
export default function CartRefreshListener() {
  const { refreshCart, clearCart } = useCart();
  const pathname = usePathname();

  // Clear cart when navigating to homepage, refresh when navigating to allowed pages
  useEffect(() => {
    if (!pathname) return;

    // Clear cart if user navigates to homepage
    if (pathname === '/' || pathname === '') {
      clearCart();
      console.log('[CartRefreshListener] Cart cleared - navigated to homepage');
      return;
    }

    // Refresh cart when navigating to allowed pages
    if (pathname.includes('/destinations/') || pathname.includes('/trip-builder')) {
      // Small delay to ensure sessionStorage is ready
      const timer = setTimeout(() => {
        refreshCart();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, refreshCart, clearCart]);

  // Refresh cart when page regains focus (user returns from another tab/window)
  // Only on allowed pages
  useEffect(() => {
    const handleFocus = () => {
      if (!pathname) return;
      
      if (pathname.includes('/destinations/') || pathname.includes('/trip-builder')) {
        refreshCart();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [pathname, refreshCart]);

  // Note: storage event only fires for localStorage, not sessionStorage
  // sessionStorage is tab-specific, so no cross-tab sync needed

  return null; // This component doesn't render anything
}
