"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr",
  "May", "Jun", "Jul", "Ago",
  "Sep", "Oct", "Nov", "Dic",
];

interface MonthPickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function MonthPicker({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
}: MonthPickerProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? now.getFullYear()
  );

  const minYear = minDate?.getFullYear() ?? 2020;
  const maxYear = maxDate?.getFullYear() ?? now.getFullYear();

  const isDisabled = (month: number) => {
    if (
      minDate &&
      (viewYear < minDate.getFullYear() ||
        (viewYear === minDate.getFullYear() && month < minDate.getMonth()))
    )
      return true;
    if (
      maxDate &&
      (viewYear > maxDate.getFullYear() ||
        (viewYear === maxDate.getFullYear() && month > maxDate.getMonth()))
    )
      return true;
    return false;
  };

  const isSelected = (month: number) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === month;

  const isCurrent = (month: number) =>
    now.getFullYear() === viewYear && now.getMonth() === month;

  return (
    <div className={cn("p-3 w-[260px]", className)}>
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg opacity-60 hover:opacity-100"
          disabled={viewYear <= minYear}
          onClick={() => setViewYear((y) => y - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold tabular-nums select-none">
          {viewYear}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg opacity-60 hover:opacity-100"
          disabled={viewYear >= maxYear}
          onClick={() => setViewYear((y) => y + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {MONTHS.map((label, i) => {
          const disabled = isDisabled(i);
          const sel = isSelected(i);
          const current = isCurrent(i) && !sel;

          return (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(new Date(viewYear, i, 1))}
              className={cn(
                "h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                sel &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                current && "bg-accent/60 text-accent-foreground",
                disabled && "text-muted-foreground/30 pointer-events-none"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
