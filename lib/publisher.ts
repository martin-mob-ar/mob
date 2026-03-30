// Publisher badge type system
// Determines badge labels and tooltips based on publisher type and screen context

export type PublisherType =
  | "inmobiliaria-red"
  | "inmobiliaria-normal"
  | "dueno-verificado"
  | "dueno-directo";

export type BadgeContext = "home" | "search" | "detail";

export interface PublisherBadgeConfig {
  label: string;
  showCheckmark: boolean;
  tooltipText: string;
}

/**
 * Derives the publisher type from database columns.
 */
export function derivePublisherType(
  tokko: boolean,
  companyName: string | null | undefined,
  mobPlan: string | null | undefined
): PublisherType {
  if (companyName) {
    return tokko ? "inmobiliaria-red" : "inmobiliaria-normal";
  }
  return mobPlan && mobPlan !== "basico" ? "dueno-verificado" : "dueno-directo";
}

const LABELS: Record<PublisherType, Record<BadgeContext, { label: string; showCheckmark: boolean }>> = {
  "inmobiliaria-red": {
    home:   { label: "Inmobiliaria", showCheckmark: false },
    search: { label: "Inmobiliaria recomendada", showCheckmark: false },
    detail: { label: "Inmobiliaria recomendada", showCheckmark: false },
  },
  "inmobiliaria-normal": {
    home:   { label: "Inmobiliaria", showCheckmark: false },
    search: { label: "Inmobiliaria asociada", showCheckmark: true },
    detail: { label: "Inmobiliaria asociada", showCheckmark: true },
  },
  "dueno-verificado": {
    home:   { label: "Dueño verificado", showCheckmark: false },
    search: { label: "Dueño verificado", showCheckmark: false },
    detail: { label: "Dueño verificado", showCheckmark: true },
  },
  "dueno-directo": {
    home:   { label: "Dueño directo", showCheckmark: false },
    search: { label: "Dueño directo", showCheckmark: false },
    detail: { label: "Dueño directo", showCheckmark: false },
  },
};

const COMPACT_LABELS: Partial<Record<PublisherType, string>> = {
  "dueno-directo": "Dueño",
  "dueno-verificado": "Dueño",
};

const GARANTIA_DISCLAIMER = "\n(Exclusivo propiedades experiencia mob e inmobiliarias asociadas)";

const TOOLTIPS: Record<PublisherType, string> = {
  "inmobiliaria-red":
    "Inmobiliaria asociada a la red de Hoggax. Accedés a una garantía 50% off" + GARANTIA_DISCLAIMER,
  "inmobiliaria-normal":
    "Asociada a mob para ofrecerte agendar vista online, reservar y acceder a garantía al 50% off" + GARANTIA_DISCLAIMER,
  "dueno-verificado":
    "Dueño verificado por mob.\nAccedés a agendar vista online, reservar y acceder a garantía al 50% off" + GARANTIA_DISCLAIMER,
  "dueno-directo":
    "Este dueño no cuenta con un plan en mob. No accederás a los beneficios de nuestra plataforma.",
};

/**
 * Returns the badge configuration for a given publisher type and screen context.
 */
export function getPublisherBadgeConfig(
  type: PublisherType,
  context: BadgeContext,
  compact?: boolean
): PublisherBadgeConfig {
  const base = LABELS[type][context];
  return {
    ...base,
    label: (compact && COMPACT_LABELS[type]) || base.label,
    tooltipText: TOOLTIPS[type],
  };
}
