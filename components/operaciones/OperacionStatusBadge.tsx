import { cn } from "@/lib/utils";
import type {
  OperacionGeneralStatus,
  ChecklistStepStatus,
  DocumentStatus,
  DocumentacionSubStage,
} from "@/lib/mock/operaciones-types";

// ─── General operation status ───────────────────────────────────────

const generalStatusConfig: Record<
  OperacionGeneralStatus,
  { label: string; className: string }
> = {
  en_proceso: {
    label: "En proceso",
    className: "bg-primary/10 text-primary",
  },
  completada: {
    label: "Completada",
    className: "bg-green-500/10 text-green-600",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-destructive/10 text-destructive",
  },
};

export function GeneralStatusBadge({
  status,
  className,
}: {
  status: OperacionGeneralStatus;
  className?: string;
}) {
  const config = generalStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// ─── Checklist step status ──────────────────────────────────────────

const stepStatusConfig: Record<
  ChecklistStepStatus,
  { label: string; className: string }
> = {
  completed: {
    label: "Completado",
    className: "bg-green-500/10 text-green-600",
  },
  in_progress: {
    label: "En curso",
    className: "bg-primary/10 text-primary",
  },
  pending: {
    label: "Pendiente",
    className: "bg-muted text-muted-foreground",
  },
};

export function StepStatusBadge({
  status,
  className,
}: {
  status: ChecklistStepStatus;
  className?: string;
}) {
  const config = stepStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// ─── Document status ────────────────────────────────────────────────

const docStatusConfig: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-warning/10 text-warning",
  },
  subido: {
    label: "Subido",
    className: "bg-primary/10 text-primary",
  },
  aprobado: {
    label: "Aprobado",
    className: "bg-green-500/10 text-green-600",
  },
  rechazado: {
    label: "Rechazado",
    className: "bg-destructive/10 text-destructive",
  },
};

export function DocStatusBadge({
  status,
  className,
}: {
  status: DocumentStatus;
  className?: string;
}) {
  const config = docStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// ─── Documentacion sub-stage ────────────────────────────────────────

const subStageConfig: Record<
  DocumentacionSubStage,
  { label: string; className: string }
> = {
  esperando_inquilino: {
    label: "Esperando documentación del inquilino",
    className: "text-warning",
  },
  esperando_aprobacion: {
    label: "Esperando aprobación de Hoggax",
    className: "text-primary",
  },
  aprobada: {
    label: "Documentación aprobada",
    className: "text-green-600",
  },
};

export function DocSubStageBadge({
  stage,
  className,
}: {
  stage: DocumentacionSubStage;
  className?: string;
}) {
  const config = subStageConfig[stage];
  return (
    <span className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}
