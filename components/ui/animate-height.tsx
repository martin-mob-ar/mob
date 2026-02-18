"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Smoothly animates content height between 0 and auto.
 * Uses CSS grid trick for animating to/from unknown heights.
 * Removes overflow-hidden after expand completes so dropdowns
 * and absolutely-positioned children aren't clipped.
 *
 * Usage:
 *   <AnimateHeight show={isOpen}>
 *     <div className="pt-3">Content here</div>
 *   </AnimateHeight>
 */
export function AnimateHeight({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [overflowHidden, setOverflowHidden] = useState(!show);

  useEffect(() => {
    if (!show) {
      setOverflowHidden(true);
    }
  }, [show]);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return;
    if (show) {
      setOverflowHidden(false);
    }
  };

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        show ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className
      )}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={overflowHidden ? "overflow-hidden" : ""}>
        {children}
      </div>
    </div>
  );
}
