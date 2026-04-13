"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface CronErrorsProps {
  errors: { date: string; message?: string; errors?: string[] }[];
}

export function CronErrors({ errors }: CronErrorsProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Flatten all errors into a single list with timestamps
  const items = useMemo(() => {
    const list: { date: string; day: string; message: string }[] = [];
    for (const entry of errors) {
      // Extract just the day part (DD/MM) for filtering
      const day = entry.date.split(",")[0]?.trim() ?? entry.date;
      if (entry.message) {
        list.push({ date: entry.date, day, message: entry.message });
      }
      if (entry.errors) {
        for (const e of entry.errors) {
          list.push({ date: entry.date, day, message: e });
        }
      }
    }
    return list;
  }, [errors]);

  // Get unique days for filter chips
  const days = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of items) {
      if (!seen.has(item.day)) {
        seen.add(item.day);
        result.push(item.day);
      }
    }
    return result;
  }, [items]);

  const filtered = selectedDay
    ? items.filter((item) => item.day === selectedDay)
    : items;

  if (items.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 text-xs text-red-600 hover:text-red-700"
      >
        <AlertCircle className="h-3 w-3" />
        <span>
          {items.length} error{items.length !== 1 ? "es" : ""}
        </span>
        {expanded ? (
          <ChevronUp className="ml-auto h-3 w-3" />
        ) : (
          <ChevronDown className="ml-auto h-3 w-3" />
        )}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1.5">
          {/* Day filter chips */}
          {days.length > 1 && (
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedDay(null)}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  selectedDay === null
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Todos ({items.length})
              </button>
              {days.map((day) => {
                const count = items.filter((i) => i.day === day).length;
                return (
                  <button
                    key={day}
                    onClick={() =>
                      setSelectedDay(selectedDay === day ? null : day)
                    }
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                      selectedDay === day
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {day} ({count})
                  </button>
                );
              })}
            </div>
          )}
          {/* Error list */}
          <div className="max-h-[240px] space-y-1 overflow-y-auto rounded border bg-muted/50 p-2">
            {filtered.map((item, i) => (
              <div key={i} className="text-xs leading-relaxed">
                <span className="text-muted-foreground">{item.date}</span>{" "}
                <span className="break-all text-red-700 dark:text-red-400">
                  {item.message}
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Sin errores para este día
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
