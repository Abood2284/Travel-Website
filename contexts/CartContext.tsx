"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartActivity {
  id: string;
  name: string;
  imageUrl?: string;
  destinationId: string;
  price?: number;
  currency?: string;
  tripRequestId: string | null;
}

interface CartContextType {
  activities: CartActivity[];
  addActivity: (activity: CartActivity) => void;
  removeActivity: (activityId: string) => void;
  clearCart: () => void;
  refreshCart: () => void;
  isActivityInCart: (activityId: string) => boolean;
  showNotification: boolean;
  setShowNotification: (show: boolean) => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<CartActivity[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load cart from sessionStorage on mount
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      const savedCart = sessionStorage.getItem('travel-cart');
      if (savedCart) {
        setActivities(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from sessionStorage:', error);
    }
  }, [isMounted]);

  // Save cart to sessionStorage whenever activities change
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      sessionStorage.setItem('travel-cart', JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to save cart to sessionStorage:', error);
    }
  }, [activities, isMounted]);

  const addActivity = (activity: CartActivity) => {
    setActivities(prev => {
      // Check if activity is already in cart
      const exists = prev.some(a => a.id === activity.id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, activity];
    });
    
    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const removeActivity = (activityId: string) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const clearCart = useCallback(() => {
    setActivities([]);
  }, []);

  const refreshCart = useCallback(() => {
    // Force reload cart from sessionStorage
    try {
      const savedCart = sessionStorage.getItem('travel-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Force update by creating a new array reference
        setActivities([...parsedCart]);
        console.log('[CartContext] Cart refreshed:', parsedCart.length, 'items');
      } else {
        setActivities([]);
        console.log('[CartContext] Cart refreshed: empty');
      }
    } catch (error) {
      console.error('Failed to refresh cart from sessionStorage:', error);
    }
  }, []);

  const isActivityInCart = useCallback((activityId: string) => {
    return activities.some(a => a.id === activityId);
  }, [activities]);

  const value: CartContextType = {
    activities,
    addActivity,
    removeActivity,
    clearCart,
    refreshCart,
    isActivityInCart,
    showNotification,
    setShowNotification,
    itemCount: activities.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
