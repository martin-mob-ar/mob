"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useContainerWidth } from "@/hooks/useContainerWidth";

/** Map Spanish day IDs (from visit_days) to JS getDay() numbers */
const DAY_ID_TO_JS: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

/** Short day labels for the UI */
const JS_DAY_ABBR = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Short month labels */
const MONTH_ABBR = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** Reverse map: JS day number → Spanish day ID */
const JS_TO_DAY_ID: Record<number, string> = {};
for (const [id, num] of Object.entries(DAY_ID_TO_JS)) {
  JS_TO_DAY_ID[num] = id;
}

// Sizing constants for dynamic item count calculation
const ARROW_WIDTH = 24; // h-6 w-6
const STRIP_GAP = 4;    // gap-1 between arrows and grid
const ITEM_GAP = 6;     // gap-1.5 between items
const DAY_MIN_WIDTH = 58;
const TIME_MIN_WIDTH = 68;

interface VisitSchedulePickerProps {
  visitDays: string[];
  visitHours: string[];
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

/** Parse "lunes 08:00-20:00" → { dayId: "lunes", start: "08:00", end: "20:00" } */
function parseVisitHourEntry(entry: string) {
  const match = entry.match(/^(\w+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!match) return null;
  return { dayId: match[1], start: match[2], end: match[3] };
}

/** Generate 1-hour increment time slots between start and end (exclusive of end) */
function generateTimeSlots(start: string, end: string): string[] {
  const [startH] = start.split(":").map(Number);
  const [endH] = end.split(":").map(Number);
  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

/** Format "14:00" → "02:00pm", "09:00" → "09:00am" */
function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}${suffix}`;
}

/** Calculate how many items fit in available width */
function calcVisibleCount(containerWidth: number, minItemWidth: number): number {
  if (containerWidth <= 0) return 4; // SSR / initial fallback
  const available = containerWidth - ARROW_WIDTH * 2 - STRIP_GAP * 2;
  return Math.max(2, Math.floor((available + ITEM_GAP) / (minItemWidth + ITEM_GAP)));
}

// Slide animation for strip pages navigating left/right
const stripVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -24 : 24,
    opacity: 0,
  }),
};

export default function VisitSchedulePicker({
  visitDays,
  visitHours,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: VisitSchedulePickerProps) {
  const { ref: containerRef, width: containerWidth } = useContainerWidth();
  const [dayOffset, setDayOffset] = useState(0);
  const [timeOffset, setTimeOffset] = useState(0);
  const [dayDirection, setDayDirection] = useState(0);
  const [timeDirection, setTimeDirection] = useState(0);
  const prevDayOffset = useRef(0);
  const prevTimeOffset = useRef(0);

  // Dynamic visible counts based on container width
  const visibleDays = calcVisibleCount(containerWidth, DAY_MIN_WIDTH);
  const visibleTimes = calcVisibleCount(containerWidth, TIME_MIN_WIDTH);

  // Build a map of dayId → { start, end } from visitHours
  const hoursMap = useMemo(() => {
    const map: Record<string, { start: string; end: string }> = {};
    for (const entry of visitHours) {
      const parsed = parseVisitHourEntry(entry);
      if (parsed) {
        map[parsed.dayId] = { start: parsed.start, end: parsed.end };
      }
    }
    return map;
  }, [visitHours]);

  // Set of allowed JS day numbers
  const allowedJsDays = useMemo(() => {
    const set = new Set<number>();
    for (const dayId of visitDays) {
      const jsDay = DAY_ID_TO_JS[dayId];
      if (jsDay !== undefined) set.add(jsDay);
    }
    return set;
  }, [visitDays]);

  // Generate available dates (next 30 days, filtered by allowed days)
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() + 1);

    for (let i = 0; i < 60 && dates.length < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (allowedJsDays.has(d.getDay())) {
        dates.push(d);
      }
    }
    return dates;
  }, [allowedJsDays]);

  // Auto-select first date on mount
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      onDateSelect(availableDates[0]);
    }
  }, [availableDates, selectedDate, onDateSelect]);

  // Time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayId = JS_TO_DAY_ID[selectedDate.getDay()];
    if (!dayId) return [];
    const hours = hoursMap[dayId];
    if (!hours) return [];
    return generateTimeSlots(hours.start, hours.end);
  }, [selectedDate, hoursMap]);

  // Reset time offset and selected time when date changes
  const handleDateSelect = useCallback(
    (date: Date) => {
      onDateSelect(date);
      onTimeSelect("");
      setTimeOffset(0);
    },
    [onDateSelect, onTimeSelect]
  );

  // Clamp offsets when visible count changes (e.g. on resize)
  useEffect(() => {
    setDayOffset((o) => Math.min(o, Math.max(0, availableDates.length - visibleDays)));
  }, [visibleDays, availableDates.length]);

  useEffect(() => {
    setTimeOffset((o) => Math.min(o, Math.max(0, timeSlots.length - visibleTimes)));
  }, [visibleTimes, timeSlots.length]);

  // Day strip navigation with direction tracking
  const handleDayNav = (dir: "prev" | "next") => {
    const d = dir === "next" ? 1 : -1;
    setDayDirection(d);
    prevDayOffset.current = dayOffset;
    setDayOffset((o) =>
      dir === "next"
        ? Math.min(availableDates.length - visibleDays, o + visibleDays)
        : Math.max(0, o - visibleDays)
    );
  };

  // Time strip navigation with direction tracking
  const handleTimeNav = (dir: "prev" | "next") => {
    const d = dir === "next" ? 1 : -1;
    setTimeDirection(d);
    prevTimeOffset.current = timeOffset;
    setTimeOffset((o) =>
      dir === "next"
        ? Math.min(timeSlots.length - visibleTimes, o + visibleTimes)
        : Math.max(0, o - visibleTimes)
    );
  };

  // Visible windows
  const visibleDateSlice = availableDates.slice(dayOffset, dayOffset + visibleDays);
  const canScrollDaysPrev = dayOffset > 0;
  const canScrollDaysNext = dayOffset + visibleDays < availableDates.length;

  const visibleTimeSlice = timeSlots.slice(timeOffset, timeOffset + visibleTimes);
  const canScrollTimesPrev = timeOffset > 0;
  const canScrollTimesNext = timeOffset + visibleTimes < timeSlots.length;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (availableDates.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No hay horarios disponibles configurados para esta propiedad.
      </div>
    );
  }

  const dayPageKey = `days-${dayOffset}`;
  const timePageKey = `times-${timeOffset}-${selectedDate?.toISOString() ?? "none"}`;

  return (
    <div ref={containerRef} className="space-y-3">
      <p className="font-semibold text-sm">Seleccioná la fecha y hora</p>

      {/* Day strip */}
      <div className="flex items-center gap-1">
        <motion.button
          type="button"
          onClick={() => handleDayNav("prev")}
          disabled={!canScrollDaysPrev}
          whileTap={canScrollDaysPrev ? { scale: 0.85 } : undefined}
          className="h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-default shrink-0 transition-colors"
          aria-label="Días anteriores"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </motion.button>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={dayDirection}>
            <motion.div
              key={dayPageKey}
              custom={dayDirection}
              variants={stripVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${visibleDateSlice.length}, minmax(0, 1fr))` }}
            >
              {visibleDateSlice.map((date, i) => {
                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                return (
                  <motion.button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 rounded-xl border-2 text-center min-w-0",
                      "transition-colors duration-200",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/40"
                    )}
                  >
                    <span className={cn(
                      "text-[11px] font-medium leading-none",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {JS_DAY_ABBR[date.getDay()]}
                    </span>
                    <span className="text-lg font-bold leading-tight text-foreground">
                      {date.getDate()}
                    </span>
                    <span className={cn(
                      "text-[11px] leading-none",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {MONTH_ABBR[date.getMonth()]}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          onClick={() => handleDayNav("next")}
          disabled={!canScrollDaysNext}
          whileTap={canScrollDaysNext ? { scale: 0.85 } : undefined}
          className="h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-default shrink-0 transition-colors"
          aria-label="Días siguientes"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Time strip — slides in when time slots become available */}
      <AnimatePresence mode="popLayout">
        {timeSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center gap-1"
          >
            <motion.button
              type="button"
              onClick={() => handleTimeNav("prev")}
              disabled={!canScrollTimesPrev}
              whileTap={canScrollTimesPrev ? { scale: 0.85 } : undefined}
              className="h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-default shrink-0 transition-colors"
              aria-label="Horarios anteriores"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </motion.button>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false} custom={timeDirection}>
                <motion.div
                  key={timePageKey}
                  custom={timeDirection}
                  variants={stripVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${visibleTimeSlice.length}, minmax(0, 1fr))` }}
                >
                  {visibleTimeSlice.map((time, i) => {
                    const isSelected = selectedTime === time;
                    return (
                      <motion.button
                        key={time}
                        type="button"
                        onClick={() => onTimeSelect(time)}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: i * 0.04,
                          duration: 0.2,
                          ease: "easeOut",
                        }}
                        className={cn(
                          "py-2 rounded-xl border-2 text-xs font-medium min-w-0 truncate",
                          "transition-colors duration-200",
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border hover:border-muted-foreground/40 text-muted-foreground"
                        )}
                      >
                        {formatTime12h(time)}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.button
              type="button"
              onClick={() => handleTimeNav("next")}
              disabled={!canScrollTimesNext}
              whileTap={canScrollTimesNext ? { scale: 0.85 } : undefined}
              className="h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-default shrink-0 transition-colors"
              aria-label="Horarios siguientes"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
