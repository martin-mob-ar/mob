export type LeadStage =
  | "sin_verificar"
  | "verificado"
  | "en_seguimiento"
  | "calificado"
  | "no_avanza";

export const leadStageConfig: Record<LeadStage, { label: string; className: string; order: number }> = {
  sin_verificar: {
    label: "Sin verificar",
    className: "bg-muted text-muted-foreground",
    order: 0,
  },
  verificado: {
    label: "Verificado",
    className: "bg-primary/10 text-primary",
    order: 1,
  },
  en_seguimiento: {
    label: "En seguimiento",
    className: "bg-amber-500/10 text-amber-600",
    order: 2,
  },
  calificado: {
    label: "Calificado",
    className: "bg-green-500/10 text-green-600",
    order: 3,
  },
  no_avanza: {
    label: "No avanza",
    className: "bg-destructive/10 text-destructive",
    order: -1,
  },
};
