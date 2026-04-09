"use client";

import { Check, Circle } from "lucide-react";
import { AnimateHeight } from "@/components/ui/animate-height";
import { cn } from "@/lib/utils";
import type { ChecklistStep as ChecklistStepType } from "@/lib/mock/operaciones-types";

interface ChecklistStepProps {
  step: ChecklistStepType;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const ChecklistStepComponent = ({
  step,
  isLast,
  isExpanded,
  onToggle,
  children,
}: ChecklistStepProps) => {
  const isCompleted = step.status === "completed";
  const isActive = step.status === "in_progress";
  const isPending = step.status === "pending";
  const hasContent = !!children;

  return (
    <div className="flex gap-3">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className={cn(
            "h-7 w-7 rounded-full shrink-0 flex items-center justify-center",
            isCompleted && "bg-green-500",
            isActive && "bg-primary ring-4 ring-primary/20",
            isPending && "bg-muted border-2 border-border"
          )}
        >
          {isCompleted && <Check className="h-4 w-4 text-white" />}
          {isActive && <Circle className="h-3 w-3 text-white fill-white" />}
          {isPending && (
            <span className="text-[10px] font-bold text-muted-foreground">
              {step.order}
            </span>
          )}
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div
            className={cn(
              "w-px flex-1 min-h-[16px]",
              isCompleted ? "bg-green-500/30" : "bg-border"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
        <button
          onClick={hasContent ? onToggle : undefined}
          className={cn(
            "w-full text-left rounded-xl border p-3 transition-colors",
            isCompleted && "border-green-500/20 bg-green-500/5",
            isActive && "border-primary/30 bg-primary/5",
            isPending && "border-border bg-card",
            hasContent && "cursor-pointer hover:bg-muted/50"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3
                className={cn(
                  "text-sm font-semibold",
                  isPending && "text-muted-foreground"
                )}
              >
                {step.title}
              </h3>
              {step.description && isCompleted && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
            {isActive && hasContent && (
              <span className="text-xs text-primary font-medium shrink-0">
                {isExpanded ? "Ocultar" : "Ver más"}
              </span>
            )}
            {isCompleted && hasContent && (
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                {isExpanded ? "Ocultar" : "Ver"}
              </span>
            )}
          </div>
        </button>

        {/* Expandable content */}
        {hasContent && (
          <AnimateHeight show={isExpanded}>
            <div className="mt-3">{children}</div>
          </AnimateHeight>
        )}
      </div>
    </div>
  );
};

export default ChecklistStepComponent;
