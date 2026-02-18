"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";

// Maps UI labels to property_type_name values in the DB
const propertyTypes = [
  { id: "Apartment", label: "Departamento" },
  { id: "House", label: "Casa" },
  { id: "Condo", label: "PH" },
];

const PropertyTypeFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilters } = useSearchFilters();
  const selected = filters.propertyTypeNames;

  const toggleType = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((t) => t !== id)
      : [...selected, id];
    setFilters({ propertyTypeNames: next });
  };

  const getLabel = () => {
    if (selected.length === 0) return "Tipo de inmueble";
    if (selected.length === 1) {
      return propertyTypes.find((t) => t.id === selected[0])?.label || "Tipo de inmueble";
    }
    return `${selected.length} tipos`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/30 transition-colors bg-background">
          <span className="text-sm font-medium">{getLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 bg-background" align="start">
        <div className="space-y-3">
          {propertyTypes.map((type) => (
            <label
              key={type.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-colors"
            >
              <Checkbox
                checked={selected.includes(type.id)}
                onCheckedChange={() => toggleType(type.id)}
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PropertyTypeFilter;
