import { useState } from "react";

const propertyTypes = [
  { id: "departamento", label: "Depto" },
  { id: "casa", label: "Casa" },
  { id: "monoambiente", label: "Mono" },
  { id: "ph", label: "PH" },
  { id: "local", label: "Local" },
  { id: "oficina", label: "Oficina" },
];

interface MobilePropertyTypeChipsProps {
  onTypeChange?: (type: string | null) => void;
}

const MobilePropertyTypeChips = ({ onTypeChange }: MobilePropertyTypeChipsProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleTypeClick = (typeId: string) => {
    const newType = selectedType === typeId ? null : typeId;
    setSelectedType(newType);
    onTypeChange?.(newType);
  };

  return (
    <div className="px-3 py-2 overflow-x-auto scrollbar-hide border-b border-border">
      <div className="flex gap-1.5">
        {propertyTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeClick(type.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              selectedType === type.id
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground/30"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobilePropertyTypeChips;
