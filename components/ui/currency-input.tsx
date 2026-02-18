"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: string; // raw numeric string (e.g. "500000")
  onChange: (rawValue: string) => void;
  currency?: "ARS" | "USD";
  placeholder?: string;
  className?: string;
}

function formatNumber(num: number): string {
  return num.toLocaleString("es-AR");
}

function parseRawValue(formatted: string): string {
  // Strip everything except digits
  return formatted.replace(/[^\d]/g, "");
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currency = "ARS", placeholder, className }, ref) => {
    const symbol = currency === "USD" ? "US$" : "AR$";

    // Display formatted value
    const displayValue = value
      ? `${symbol} ${formatNumber(Number(value))}`
      : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseRawValue(e.target.value);
      onChange(raw);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Move cursor to end on focus
      requestAnimationFrame(() => {
        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
      });
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder || `${symbol} 0`}
          className={cn(
            "flex h-11 w-full rounded-xl border border-input bg-background pl-3 pr-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-medium tabular-nums",
            className,
          )}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
