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
  variant?: "default" | "wizard";
  showSelectButtons?: boolean;
  showCostNote?: boolean;
}

// Pricing data (shared source of truth)
export const pricingSections = [
  {
    title: "Publicación",
    rows: [
      { feature: "Promoción", basico: "Publicación básica", acompanado: "Publicación destacada", experiencia: "Destacada + redes", tooltip: "" },
      { feature: "Fotos", basico: "Subí tus fotos", acompanado: "Subí tus fotos", experiencia: "Fotógrafo profesional", tooltip: "" },
      { feature: "Precio sugerido", basico: "—", acompanado: "—", experiencia: "Incluido", tooltip: "" },
      { feature: "Verificación", basico: "Propietario", acompanado: "Propietario", experiencia: "Propietario + propiedad", tooltip: "", experienciaTooltip: "Le destacamos al inquilino que tu propiedad fue verificada" },
      { feature: "Aviso mejorado con IA", basico: "Incluido", acompanado: "Incluido", experiencia: "Incluido", tooltip: "" },
    ],
  },
  {
    title: "Gestión",
    rows: [
      { feature: "Interesados", basico: "—", acompanado: "Verificados y calificados", experiencia: "Verificados y calificados", tooltip: "" },
      { feature: "Visitas", basico: "—", acompanado: "Coordinación y seguimiento", experiencia: "Coordinación y seguimiento", tooltip: "" },
    ],
  },
  {
    title: "Legal",
    rows: [
      { feature: "Contrato", basico: "—", acompanado: "Plantilla", experiencia: "Confección", tooltip: "" },
      { feature: "Firma electrónica", basico: "—", acompanado: "Incluida", experiencia: "Incluida", tooltip: "" },
      { feature: "Garantía para tu inquilino", basico: "Descuento 20%", acompanado: "Descuento 30%", experiencia: "Descuento 50%", tooltip: "", experienciaTooltip: "Exclusivo propiedades experiencia mob e inmobiliarias asociadas" },
    ],
  },
];

export const pricingCost: Record<PlanType, string> = {
  basico: "$0",
  acompanado: "USD 99",
  experiencia: "USD 299",
};

const CellContent = ({ value, isHighlighted = false }: { value: string; isHighlighted?: boolean }) => {
  if (value === "—") return <Minus className="h-4 w-4 text-muted-foreground/60 mx-auto" />;
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
  hasSelection,
  onSelectPlan,
  openSections,
  toggleSection,
  isWizard,
}: {
  plan: PlanType;
  isRecommended?: boolean;
  isSelected: boolean;
  hasSelection: boolean;
  onSelectPlan: (p: PlanType) => void;
  openSections: Record<string, boolean>;
  toggleSection: (key: string) => void;
  isWizard?: boolean;
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
        "rounded-xl p-6 transition-all cursor-pointer",
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

      <div className={cn("mb-6 pb-6 border-b", isWizard ? "border-border" : "border-border/50")}>
        <div className={cn("uppercase tracking-wider mb-1", isWizard ? "text-xs font-semibold text-foreground/80" : "text-xs text-muted-foreground")}>Costo de plataforma</div>
        <div className={cn("font-bold", isWizard ? "text-base text-foreground" : "text-sm text-foreground")}>{pricingCost[plan]}</div>
      </div>

      <div className="space-y-1 mb-6">
        {pricingSections.map((section, idx) => (
          <Collapsible
            key={idx}
            open={openSections[`${plan}-${section.title}`]}
            onOpenChange={() => toggleSection(`${plan}-${section.title}`)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-left group">
              <span className={cn(
                "font-bold uppercase tracking-wider group-hover:text-foreground transition-colors",
                isWizard ? "text-xs text-foreground/90" : "text-[11px] text-foreground/70"
              )}>
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
                        <Minus className={cn("h-4 w-4 mt-0.5 flex-shrink-0", isWizard ? "text-muted-foreground/60" : "text-muted-foreground/50")} />
                      ) : (
                        <Check className={cn("h-4 w-4 mt-0.5 flex-shrink-0", isSelected || isRecommended ? "text-primary" : "text-muted-foreground")} />
                      )}
                      <div>
                        <div className={cn("flex items-center gap-1", isWizard ? "text-sm text-muted-foreground" : "text-xs", isEmpty ? (isWizard ? "text-muted-foreground/70" : "text-muted-foreground/60") : (isWizard ? "text-foreground/80" : "text-muted-foreground"))}>
                          {row.feature}
                          {row.tooltip && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground cursor-help flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[220px] text-xs">{row.tooltip}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {!isEmpty && (
                          <div className={cn("inline-flex items-center gap-1", isWizard ? "text-base" : "text-sm", isSelected || isRecommended ? "text-foreground font-medium" : "text-foreground")}>
                            {value}
                            {plan === "experiencia" && (row as Record<string, string>).experienciaTooltip && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground cursor-help flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[220px] text-xs">{(row as Record<string, string>).experienciaTooltip}</TooltipContent>
                              </Tooltip>
                            )}
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
        variant={isSelected || (isRecommended && !hasSelection) ? "default" : "outline"}
        size="lg"
        className={cn(
          "w-full rounded-full",
          isSelected && "ring-2 ring-offset-2 ring-primary"
        )}
        onClick={(e) => { e.stopPropagation(); onSelectPlan(plan); }}
      >
        {isSelected ? "✓ Seleccionado" : planCtas[plan]}
      </Button>
    </div>
  );
};

export const PlanSelector = ({ selectedPlan, onSelectPlan, variant = "default", showSelectButtons = true, showCostNote = true }: PlanSelectorProps) => {
  const isWizard = variant === "wizard";
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
        <div className={cn(
          "relative rounded-xl border overflow-hidden",
          isWizard ? "bg-white border-border" : "bg-white border-border/40"
        )}>
          {/* Highlighted column background for selected plan */}
          <div className={cn(
            "absolute top-0 bottom-0 w-1/4 border-l pointer-events-none",
            (!selectedPlan || selectedPlan === "experiencia") && "left-3/4 rounded-tr-xl",
            selectedPlan === "basico" && "left-1/4 border-r",
            selectedPlan === "acompanado" && "left-2/4 border-r",
            isWizard ? "bg-primary/[0.06] border-primary/30" : "bg-primary/[0.04] border-primary/20"
          )} />

          {/* Header row */}
          <div className={cn(
            "grid grid-cols-[1fr_1fr_1fr_1fr] border-b relative",
            isWizard ? "border-border" : "border-border/30"
          )}>
            <div className={cn(isWizard ? "px-3 py-2 xl:px-5 xl:py-3" : "px-3 py-2")} />
            {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => (
              <div
                key={plan}
                className={cn(
                  "text-center cursor-pointer transition-colors hover:bg-primary/5",
                  isWizard ? "px-3 py-2 xl:px-5 xl:py-3" : "px-3 py-2",
                  selectedPlan === plan && "bg-primary/10"
                )}
                onClick={() => onSelectPlan(plan)}
              >
                <span className={cn(
                  "font-semibold",
                  isWizard ? "text-sm xl:text-base" : "text-sm",
                  selectedPlan === plan ? "text-primary" : "text-foreground"
                )}>
                  {plan === "basico" ? "Básico" : plan === "acompanado" ? "Acompañado" : <>Experiencia <span className="font-ubuntu text-primary">mob</span></>}
                </span>
                {selectedPlan === plan && (
                  <div className={cn("text-primary font-medium mt-0.5", isWizard ? "text-[10px] xl:text-xs" : "text-[10px]")}>✓ Seleccionado</div>
                )}
              </div>
            ))}
          </div>

          {/* Table body */}
          <div className="relative">
            {pricingSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr]">
                  <div className={cn(isWizard ? "px-3 py-1 xl:px-5 xl:py-2 bg-muted/40 xl:bg-muted/60" : "px-3 py-1 bg-muted/40")}>
                    <span className={cn(
                      "font-bold uppercase tracking-wider",
                      isWizard ? "text-[10px] xl:text-xs text-foreground/80 xl:text-foreground/90" : "text-[10px] text-foreground/80"
                    )}>
                      {section.title}
                    </span>
                  </div>
                  {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => (
                    <div
                      key={plan}
                      className={cn(
                        selectedPlan === plan
                          ? "bg-primary/10"
                          : isWizard ? "bg-muted/40 xl:bg-muted/60" : "bg-muted/40"
                      )}
                    />
                  ))}
                </div>
                {section.rows.map((row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className={cn(
                      "grid grid-cols-[1fr_1fr_1fr_1fr]",
                      rowIdx < section.rows.length - 1 && (isWizard ? "border-b border-border/30" : "border-b border-border/10")
                    )}
                  >
                    <div className={cn(
                      "flex items-center gap-1.5",
                      isWizard ? "px-3 py-1.5 xl:px-5 xl:py-2.5" : "px-3 py-1.5"
                    )}>
                      <span className={cn(
                        isWizard ? "text-xs xl:text-sm text-muted-foreground xl:text-foreground/80" : "text-xs text-muted-foreground"
                      )}>{row.feature}</span>
                      {row.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground cursor-help flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[220px] text-xs">{row.tooltip}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => {
                      const cellTooltip = plan === "experiencia" && (row as Record<string, string>).experienciaTooltip;
                      return (
                      <div
                        key={plan}
                        className={cn(
                          "flex items-center justify-center cursor-pointer transition-colors hover:bg-primary/5",
                          isWizard ? "px-3 py-1.5 xl:px-5 xl:py-2.5" : "px-3 py-1.5",
                          selectedPlan === plan && "bg-primary/5"
                        )}
                        onClick={() => onSelectPlan(plan)}
                      >
                        {row[plan] === "—" ? (
                          <span className={cn(
                            isWizard ? "text-muted-foreground/50 text-xs xl:text-sm" : "text-muted-foreground/50 text-xs"
                          )}>—</span>
                        ) : row[plan] === "Incluido" || row[plan] === "Incluida" ? (
                          <Check className={cn(
                            isWizard ? "h-3.5 w-3.5 xl:h-4 xl:w-4" : "h-3.5 w-3.5",
                            selectedPlan === plan ? "text-primary" : plan === "experiencia" ? "text-primary" : "text-muted-foreground/80"
                          )} />
                        ) : (
                          <span className={cn(
                            "text-center inline-flex items-center gap-1",
                            isWizard ? "text-xs xl:text-sm" : "text-xs",
                            selectedPlan === plan ? "text-foreground font-semibold" : plan === "experiencia" ? "text-foreground font-semibold" : "text-muted-foreground"
                          )}>
                            {row[plan]}
                            {cellTooltip && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground cursor-help flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[220px] text-xs">{cellTooltip}</TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        )}
                      </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}

            {/* Cost row */}
            <div className={cn(
              "grid grid-cols-[1fr_1fr_1fr_1fr] border-t",
              isWizard ? "border-border" : "border-border/30"
            )}>
              <div className={cn("flex items-center", isWizard ? "px-3 py-2 xl:px-5 xl:py-2.5 bg-muted/20 xl:bg-muted/40" : "px-3 py-2 bg-muted/20")}>
                <span className={cn(
                  "font-medium text-foreground",
                  isWizard ? "text-xs xl:text-sm" : "text-xs"
                )}>Costo de plataforma</span>
              </div>
              {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => (
                <div key={plan} className={cn("flex items-center justify-center", isWizard ? "px-3 py-2 xl:px-5 xl:py-2.5" : "px-3 py-2", selectedPlan === plan ? "bg-primary/10" : isWizard ? "bg-muted/20 xl:bg-muted/40" : "bg-muted/20")}>
                  <span className={cn(
                    "font-bold",
                    isWizard ? "text-xs xl:text-sm" : "text-xs",
                    selectedPlan === plan ? "text-primary" : "text-foreground"
                  )}>
                    {pricingCost[plan]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop plan select buttons */}
        {showSelectButtons && (
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] mt-6">
            <div />
            {(["basico", "acompanado", "experiencia"] as PlanType[]).map((plan) => (
              <div key={plan} className="px-2 flex justify-center">
                <Button
                  variant={selectedPlan === plan || (!selectedPlan && plan === "experiencia") ? "default" : "outline"}
                  size="lg"
                  className={cn(
                    "rounded-full w-full",
                    selectedPlan === plan && "ring-2 ring-offset-2 ring-primary"
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
              </div>
            ))}
          </div>
        )}

        {showCostNote && (
          <div className="text-center mt-6 space-y-1">
            <p className={cn(
              "font-semibold text-foreground",
              isWizard ? "text-sm xl:text-base" : "text-sm"
            )}>
              El costo se cobra únicamente cuando el alquiler se concreta.
            </p>
            <p className={cn(
              "font-medium text-muted-foreground",
              isWizard ? "text-sm" : "text-sm"
            )}>No hay costos iniciales.</p>
          </div>
        )}
      </div>

      {/* Mobile: Stacked cards */}
      <div className="lg:hidden space-y-4">
        <MobilePlanCard
          plan="experiencia"
          isRecommended
          isSelected={selectedPlan === "experiencia"}
          hasSelection={selectedPlan !== null}
          onSelectPlan={onSelectPlan}
          openSections={openSections}
          toggleSection={toggleSection}
          isWizard={isWizard}
        />
        <MobilePlanCard
          plan="acompanado"
          isSelected={selectedPlan === "acompanado"}
          hasSelection={selectedPlan !== null}
          onSelectPlan={onSelectPlan}
          openSections={openSections}
          toggleSection={toggleSection}
          isWizard={isWizard}
        />
        <MobilePlanCard
          plan="basico"
          isSelected={selectedPlan === "basico"}
          hasSelection={selectedPlan !== null}
          onSelectPlan={onSelectPlan}
          openSections={openSections}
          toggleSection={toggleSection}
          isWizard={isWizard}
        />
        {showCostNote && (
          <p className="text-center text-base font-medium text-foreground pt-4">
            El costo se cobra únicamente cuando el alquiler se concreta.
          </p>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default PlanSelector;
