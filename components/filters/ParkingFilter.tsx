"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";

const ParkingFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilter } = useSearchFilters();
  const selectedParking = filters.parking ? parseInt(filters.parking) : null;

  const parkingOptions = [
    { label: "0+", value: 0 },
    { label: "1+", value: 1 },
    { label: "2+", value: 2 },
    { label: "3+", value: 3 },
  ];

  const handleSelect = (value: number) => {
    if (selectedParking === value) {
      setFilter("parking", "");
    } else {
      setFilter("parking", String(value));
    }
  };

  const getDisplayText = () => {
    if (selectedParking !== null) {
      return `${selectedParking}+ cochera${selectedParking !== 1 ? "s" : ""}`;
    }
    return "Cocheras";
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/30 transition-colors bg-background">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{getDisplayText()}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-4 bg-background" align="start">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Cocheras
          </p>
          <div className="flex flex-wrap gap-2">
            {parkingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedParking === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ParkingFilter;
