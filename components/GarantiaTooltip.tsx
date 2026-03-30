"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const GARANTIA_TOOLTIP_TEXT = "Exclusivo propiedades experiencia mob e inmobiliarias asociadas";

export function GarantiaTooltip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className ?? "underline decoration-dotted decoration-current/40 underline-offset-2 cursor-help"}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[240px]">
        <p className="text-xs">{GARANTIA_TOOLTIP_TEXT}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export { GARANTIA_TOOLTIP_TEXT };
