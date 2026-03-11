"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InfoTooltipProps {
  text: string;
  /** Size of the info icon in pixels. Default 14 */
  size?: number;
  className?: string;
}

/**
 * An "i" info icon that shows a tooltip on hover (desktop) and tap (mobile).
 * Uses Popover for reliable cross-device behavior.
 */
export function InfoTooltip({ text, size = 14, className = "" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside tap (mobile)
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Más información"
          className={`inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors touch-manipulation ${className}`}
          style={{ width: size + 4, height: size + 4 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <Info style={{ width: size, height: size }} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        className="max-w-[260px] text-xs leading-relaxed whitespace-pre-line px-3 py-2"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {text}
      </PopoverContent>
    </Popover>
  );
}
