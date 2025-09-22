"use client";

import * as React from "react";

export function useEnterAdvance(
  getAction: (event: KeyboardEvent) => (() => void) | null,
  enabled: boolean
) {
  React.useEffect(() => {
    if (!enabled) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.isComposing) return;
      const action = getAction(event);
      if (!action) return;
      event.preventDefault();
      action();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [getAction, enabled]);
}
