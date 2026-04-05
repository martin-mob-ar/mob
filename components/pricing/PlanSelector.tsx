"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, X, Info } from "lucide-react";

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

// Curated highlights for mobile cards
const planHighlights: Record<PlanType, { text: string; included: boolean }[]> = {
  experiencia: [
    { text: "Solo inquilinos calificados", included: true },
    { text: "Confección de contrato", included: true },
    { text: "Firma electrónica", included: true },
    { text: "Coordinación de visitas", included: true },
    { text: "Fotógrafo profesional", included: true },
    { text: "50% off garantía para tu inquilino", included: true },
  ],
  acompanado: [
    { text: "Solo inquilinos calificados", included: true },
    { text: "Plantilla de contrato", included: true },
    { text: "Firma electrónica", included: true },
    { text: "Coordinación de visitas", included: true },
    { text: "30% off garantía para tu inquilino", included: true },
  ],
  basico: [
    { text: "Interesados sin verificar", included: false },
    { text: "Sin destaque", included: false },
    { text: "20% off garantía para tu inquilino", included: true },
  ],
};

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

// Mobile card for each plan
const MobilePlanCard = ({
  plan,
  isSelected,
  onSelectPlan,
  isOpen,
  onToggle,
}: {
  plan: PlanType;
  isSelected: boolean;
  onSelectPlan: (p: PlanType) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const highlights = planHighlights[plan];

  return (
    <div
      className={cn(
        "rounded-2xl transition-all cursor-pointer",
        isSelected
          ? "border-2 border-primary shadow-lg shadow-primary/10"
          : "border border-border/60"
      )}
      onClick={() => onSelectPlan(plan)}
    >
      {/* Header: name, price, description, chevron */}
      <div className="flex items-start justify-between p-6 pb-0">
        <div>
          <h3 className="font-display font-bold text-2xl">
            {planNames[plan]}
          </h3>
          <p className={cn(
            "font-bold text-xl mt-0.5",
            isSelected ? "text-primary" : "text-foreground"
          )}>
            {pricingCost[plan]}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {planDescriptions[plan]}
          </p>
        </div>
        <button
          type="button"
          className="mt-1 p-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={isOpen ? "Ocultar detalles" : "Ver detalles"}
        >
          <ChevronDown className={cn(
            "h-5 w-5 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
      </div>

      {/* Features list */}
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="border-t border-border/40 mt-4 pt-4">
            <div className="space-y-3">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.included ? (
                    <Check className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                  ) : (
                    <X className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                  )}
                  <span className={cn(
                    "text-base",
                    item.included ? "text-foreground font-medium" : "text-muted-foreground/60"
                  )}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PlanSelector = ({ selectedPlan, onSelectPlan, variant = "default", showSelectButtons = true, showCostNote = true }: PlanSelectorProps) => {
  const isWizard = variant === "wizard";

  // Mobile: track which cards are expanded (all open by default)
  const [mobileOpenCards, setMobileOpenCards] = useState<Record<PlanType, boolean>>({
    experiencia: true,
    acompanado: true,
    basico: true,
  });

  const toggleMobileCard = (plan: PlanType) => {
    setMobileOpenCards((prev) => ({ ...prev, [plan]: !prev[plan] }));
  };

  return (
    <TooltipProvider>
    <div className="max-w-5xl mx-auto">
      {showCostNote && (
        <div className="mb-4 space-y-0.5">
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

      </div>

      {/* Mobile: Stacked cards */}
      <div className="lg:hidden space-y-4">
        {(["experiencia", "acompanado", "basico"] as PlanType[]).map((plan) => (
          <MobilePlanCard
            key={plan}
            plan={plan}
            isSelected={selectedPlan === plan}
            onSelectPlan={onSelectPlan}
            isOpen={mobileOpenCards[plan]}
            onToggle={() => toggleMobileCard(plan)}
          />
        ))}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default PlanSelector;
