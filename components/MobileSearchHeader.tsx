import { SlidersHorizontal } from "lucide-react";

interface MobileSearchHeaderProps {
  location?: string;
  filtersApplied?: number;
  onFiltersClick: () => void;
}

const MobileSearchHeader = ({
  location = "Buenos Aires",
  filtersApplied = 0,
  onFiltersClick,
}: MobileSearchHeaderProps) => {
  return (
    <div className="px-4 py-3">
      <button
        onClick={onFiltersClick}
        className="w-full bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex-1 min-w-0 text-left">
          <p className="font-display font-semibold text-base text-foreground truncate">
            {location}
          </p>
          <p className="text-sm text-muted-foreground">
            Alquilar · {filtersApplied > 0 ? `${filtersApplied} filtros activos` : "Sin filtros"}
          </p>
        </div>
        <div className="ml-3 h-10 w-10 rounded-full border border-border flex items-center justify-center bg-background">
          <SlidersHorizontal className="h-5 w-5 text-foreground" />
        </div>
      </button>
    </div>
  );
};

export default MobileSearchHeader;
