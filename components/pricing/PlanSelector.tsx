"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Minus, ChevronDown, Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type PlanType = "basico" | "acompanado" | "experiencia";

export interface PlanSelectorProps {
  selectedPlan: PlanType | null;
  onSelectPlan: (plan: PlanType) => void;
}

// Pricing data (shared source of truth)
export const pricingSections = [
  {
    title: "Publicación",
    rows: [
      { feature: "Promoción", basico: "Publicación básica", acompanado: "Publicación destacada", experiencia: "Destacada + redes", tooltip: "" },
      { feature: "Fotos", basico: "Subí tus fotos", acompanado: "Subí tus fotos", experiencia: "Fotógrafo profesional", tooltip: "" },
      { feature: "Precio sugerido", basico: "—", acompanado: "—", experiencia: "Incluido", tooltip: "" },
      { feature: "Verificación", basico: "Propietario", acompanado: "Propietario", experiencia: "Propietario + propiedad", tooltip: "" },
      { feature: "Aviso mejorado con IA", basico: "Incluido", acompanado: "Incluido", experiencia: "Incluido", tooltip: "" },
    ],
  },
  {
    title: "Gestión",
    rows: [
      { feature: "Interesados", basico: "—", acompanado: "Verificados y calificados", experiencia: "Verificados y calificados", tooltip: "" },
      { feature: "Visitas", basico: "—", acompanado: "Gestión de disponibilidad", experiencia: "Coordinación y seguimiento", tooltip: "" },
    ],
  },
  {
    title: "Legal",
    rows: [
      { feature: "Contrato", basico: "—", acompanado: "Confección", experiencia: "Confección", tooltip: "" },
      { feature: "Firma electrónica", basico: "—", acompanado: "Incluida", experiencia: "Incluida", tooltip: "" },
      { feature: "Garantía para tu inquilino", basico: "Descuento 20%", acompanado: "Descuento 30%", experiencia: "Descuento 50%", tooltip: "" },
    ],
  },
];

export const pricingCost: Record<PlanType, string> = {
  basico: "$0",
  acompanado: "$100",
  experiencia: "Medio mes",
};

const CellContent = ({ value, isHighlighted = false }: { value: string; isHighlighted?: boolean }) => {
  if (value === "—") return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return (
    <span className={cn("text-sm leading-relaxed", isHighlighted ? "text-foreground font-medium" : "text-muted-foreground")}>
      {value}
    </span>
  );
};

// Mobile card for each plan
const MobilePlanCard = ({
  plan,
  isRecommended,
  isSelected,
  onSelectPlan,
  openSections,
  toggleSection,
}: {
  plan: PlanType;
  isRecommended?: boolean;
  isSelected: boolean;
  onSelectPlan: (p: PlanType) => void;
  openSections: Record<string, boolean>;
  toggleSection: (key: string) => void;
}) => {
  const planNames: Record<PlanType, React.ReactNode> = {
    basico: "Básico",
    acompanado: "Acompañado",
    experiencia: <>Experiencia <span className="font-ubuntu text-primary">mob</span></>,
  };
  const planDescriptions: Record<PlanType, string> = {
    basico: "Para empezar sin costo",
    acompanado: "Más visibilidad y soporte",
    experiencia: "Gestión completa, sin ocuparte de nada",
  };
  const planCtas: Record<PlanType, string> = {
    basico: "Elegir básico",
    acompanado: "Elegir acompañado",
    experiencia: "Quiero gestión completa",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all cursor-pointer",
        isSelected
          ? "bg-primary/[0.06] border-2 border-primary shadow-lg shadow-primary/10"
          : isRecommended
          ? "bg-primary/[0.03] border-2 border-primary/40 shadow-md shadow-primary/5"
          : "bg-card border border-border/60"
      )}
      onClick={() => onSelectPlan(plan)}
    >
      <div className="mb-6">
        {isRecommended && !isSelected && (
          <span className="inline-block bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full mb-3 tracking-wide">
            RECOMENDADO
          </span>
        )}
        {isSelected && (
          <span className="inline-block bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full mb-3 tracking-wide">
            SELECCIONADO
          </span>
        )}
        <h3 className={cn("font-display font-bold mb-1", isRecommended || isSelected ? "text-2xl" : "text-xl")}>
          {planNames[plan]}
        </h3>
        <p className="text-sm text-muted-foreground">{planDescriptions[plan]}</p>
      </div>

      <div className="mb-6 pb-6 border-b border-border/50">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Costo de plataforma</div>
        <div className="text-sm text-muted-foreground">{pricingCost[plan]}</div>
      </div>

      <div className="space-y-1 mb-6">
        {pricingSections.map((section, idx) => (
          <Collapsible
            key={idx}
            open={openSections[`${plan}-${section.title}`]}
            onOpenChange={() => toggleSection(`${plan}-${section.title}`)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-left group">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70 group-hover:text-foreground transition-colors">
                {section.title}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform",
                  openSections[`${plan}-${section.title}`] && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pb-3">
                {section.rows.map((row, rowIdx) => {
                  const value = row[plan];
                  const isEmpty = value === "—";
                  return (
                    <div key={rowIdx} className="flex items-start gap-3">
                      {isEmpty ? (
                        <Minus className="h-4 w-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Check className={cn("h-4 w-4 mt-0.5 flex-shrink-0", isSelected || isRecommended ? "text-primary" : "text-muted-foreground")} />
                      )}
                      <div>
                        <div className={cn("text-xs flex items-center gap-1", isEmpty ? "text-muted-foreground/50" : "text-muted-foreground")}>
                          {row.feature}
                          {row.tooltip && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[220px] text-xs">{row.tooltip}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {!isEmpty && (
                          <div className={cn("text-sm", isSelected || isRecommended ? "text-foreground font-medium" : "text-foreground")}>
                            {value}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <Button
        variant={isSelected ? "default" : plan === "experiencia" ? "default" : "outline"}
        size="lg"
        className={cn(
          "w-full rounded-full",
          isSelected && "ring-2 ring-offset-2 ring-primary",
          plan === "experiencia" && !isSelected && "shadow-md shadow-primary/20"
        )}
        onClick={(e) => { e.stopPropagation(); onSelectPlan(plan); }}
      >
        {isSelected ? "✓ Seleccionado" : planCtas[plan]}
      </Button>
    </div>
  );
};

export const PlanSelector = ({ selectedPlan, onSelectPlan }: PlanSelectorProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    (["basico", "acompanado", "experiencia"] as PlanType[]).forEach((plan) => {
      pricingSections.forEach((section) => {
        initial[`${plan}-${section.title}`] = true;
      });
    });
    return initial;
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <TooltipProvider>
    <div className="max-w-5xl mx-auto">
      {/* Desktop: Compact comparative table */}
      <div className="hidden lg:block">
        <div className="relative bg-white rounded-xl border border-border/40 overflow-hidden">
          {/* Highlighted column background for Experiencia mob */}
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-primary/[0.04] border-l border-primary/20 pointer-events-none rounded-tr-xl" />

          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-border/30 relative">
            <div className="px-3 py-2" />
            {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => (
              <div
                key={plan}
                className={cn(
                  "px-3 py-2 text-center cursor-pointer transition-colors hover:bg-primary/5",
                  selectedPlan === plan && "bg-primary/10"
                )}
                onClick={() => onSelectPlan(plan)}
              >
                <span className={cn("text-sm font-semibold", selectedPlan === plan ? "text-primary" : "text-foreground")}>
                  {plan === "basico" ? "Básico" : plan === "acompanado" ? "Acompañado" : <>Experiencia <span className="font-ubuntu text-primary">mob</span></>}
                </span>
                {selectedPlan === plan && (
                  <div className="text-[10px] text-primary font-medium mt-0.5">✓ Seleccionado</div>
                )}
              </div>
            ))}
          </div>

          {/* Table body */}
          <div className="relative">
            {pricingSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-muted/40">
                  <div className="px-3 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      {section.title}
                    </span>
                  </div>
                  <div /><div /><div />
                </div>
                {section.rows.map((row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className={cn("grid grid-cols-[1fr_1fr_1fr_1fr]", rowIdx < section.rows.length - 1 && "border-b border-border/10")}
                  >
                    <div className="px-3 py-1.5 flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{row.feature}</span>
                      {row.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[220px] text-xs">{row.tooltip}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => (
                      <div
                        key={plan}
                        className={cn("px-3 py-1.5 flex items-center justify-center cursor-pointer transition-colors hover:bg-primary/5", selectedPlan === plan && "bg-primary/5")}
                        onClick={() => onSelectPlan(plan)}
                      >
                        {row[plan] === "—" ? (
                          <span className="text-muted-foreground/25 text-xs">—</span>
                        ) : row[plan] === "Incluido" || row[plan] === "Incluida" ? (
                          <Check className={cn("h-3.5 w-3.5", selectedPlan === plan ? "text-primary" : plan === "experiencia" ? "text-primary" : "text-muted-foreground/60")} />
                        ) : (
                          <span className={cn("text-xs text-center", selectedPlan === plan ? "text-foreground font-semibold" : plan === "experiencia" ? "text-foreground font-semibold" : "text-muted-foreground")}>
                            {row[plan]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Cost row */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-t border-border/30 bg-muted/20">
              <div className="px-3 py-2 flex items-center">
                <span className="text-xs font-medium text-foreground">Costo de plataforma</span>
              </div>
              {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => (
                <div key={plan} className="px-3 py-2 flex items-center justify-center">
                  <span className={cn("text-xs", selectedPlan === plan ? "text-primary font-semibold" : "text-muted-foreground")}>
                    {pricingCost[plan]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop plan select buttons */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => (
            <Button
              key={plan}
              variant={selectedPlan === plan ? "default" : plan === "experiencia" ? "default" : "outline"}
              size="lg"
              className={cn(
                "rounded-full",
                selectedPlan === plan && "ring-2 ring-offset-2 ring-primary",
                plan === "experiencia" && selectedPlan !== plan && "shadow-md shadow-primary/20"
              )}
              onClick={() => onSelectPlan(plan)}
            >
              {selectedPlan === plan
                ? "✓ Seleccionado"
                : plan === "basico"
                ? "Elegir básico"
                : plan === "acompanado"
                ? "Elegir acompañado"
                : "Quiero gestión completa"}
            </Button>
          ))}
        </div>

        <div className="text-center mt-6 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            El costo se cobra únicamente cuando el alquiler se concreta.
          </p>
          <p className="text-sm font-medium text-muted-foreground">No hay costos iniciales.</p>
        </div>
      </div>

      {/* Mobile: Stacked cards */}
      <div className="lg:hidden space-y-4">
        <MobilePlanCard
          plan="experiencia"
          isRecommended
          isSelected={selectedPlan === "experiencia"}
          onSelectPlan={onSelectPlan}
          openSections={openSections}
          toggleSection={toggleSection}
        />
        <MobilePlanCard
          plan="acompanado"
          isSelected={selectedPlan === "acompanado"}
          onSelectPlan={onSelectPlan}
          openSections={openSections}
          toggleSection={toggleSection}
        />
        <MobilePlanCard
          plan="basico"
          isSelected={selectedPlan === "basico"}
          onSelectPlan={onSelectPlan}
          openSections={openSections}
          toggleSection={toggleSection}
        />
        <p className="text-center text-base font-medium text-foreground pt-4">
          El costo se cobra únicamente cuando el alquiler se concreta.
        </p>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default PlanSelector;
