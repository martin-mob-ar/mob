"use client";

import { useState, useCallback } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const GARANTIA_TOOLTIP_TEXT = "Exclusivo propiedades experiencia mob e inmobiliarias asociadas";

export function GarantiaTooltip({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);

  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setOpen(true);
  }, []);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setOpen(false);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          className={className ?? "inline-flex items-center gap-1 cursor-help"}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          {children}
          <Info className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[240px] px-3 py-2" side="top" sideOffset={6}>
        <p className="text-xs text-muted-foreground">{GARANTIA_TOOLTIP_TEXT}</p>
      </PopoverContent>
    </Popover>
  );
}

export { GARANTIA_TOOLTIP_TEXT };
