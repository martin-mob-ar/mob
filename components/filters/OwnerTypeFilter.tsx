"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";

const ownerTypeOptions = [
  { value: "" as const, label: "Todos" },
  { value: "inmobiliaria" as const, label: "Inmobiliaria" },
  { value: "dueno" as const, label: "Dueño directo" },
];

const OwnerTypeFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilter } = useSearchFilters();

  const currentLabel =
    ownerTypeOptions.find((o) => o.value === filters.ownerType)?.label ||
    "Tipo de dueño";

  const handleSelect = (value: "" | "dueno" | "inmobiliaria") => {
    setFilter("ownerType", value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/30 transition-colors bg-background">
          <span className="text-sm font-medium">{currentLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 bg-background" align="start">
        <div className="space-y-0.5">
          {ownerTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                filters.ownerType === option.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-secondary/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OwnerTypeFilter;
