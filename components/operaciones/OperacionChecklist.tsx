"use client";

import { useState } from "react";
import type { Operacion, OperacionViewerRole } from "@/lib/mock/operaciones-types";
import ChecklistStep from "./ChecklistStep";
import DocumentacionPanel from "./DocumentacionPanel";
import ContractDataForm from "./ContractDataForm";
import FirmaTimeline from "./FirmaTimeline";

interface OperacionChecklistProps {
  operation: Operacion;
  role: OperacionViewerRole;
}

const OperacionChecklist = ({ operation, role }: OperacionChecklistProps) => {
  // Auto-expand the active step
  const [expandedStep, setExpandedStep] = useState<string | null>(() => {
    const active = operation.checklist.find((s) => s.status === "in_progress");
    return active?.id ?? null;
  });

  const toggleStep = (stepId: string) => {
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  };

  return (
    <div className="space-y-0">
      {operation.checklist.map((step, idx) => {
        const isLast = idx === operation.checklist.length - 1;
        const isExpanded = expandedStep === step.id;
        const hasExpandable =
          step.order === 2 || step.order === 5 || step.order === 6;

        return (
          <ChecklistStep
            key={step.id}
            step={step}
            isLast={isLast}
            isExpanded={isExpanded}
            onToggle={() => toggleStep(step.id)}
          >
            {/* Step 2: Documentación */}
            {step.order === 2 && step.documents && step.documents.length > 0 && (
              <DocumentacionPanel
                step={step}
                role={role}
              />
            )}

            {/* Step 5: Datos de contrato */}
            {step.order === 5 && (
              <ContractDataForm
                contractData={operation.contractData}
                role={role}
              />
            )}

            {/* Step 6: Firma */}
            {step.order === 6 && step.firmaStage && (
              <FirmaTimeline
                currentStage={step.firmaStage}
                role={role}
              />
            )}

            {/* Steps 1,3,4 have no expandable content */}
            {!hasExpandable ? undefined : null}
          </ChecklistStep>
        );
      })}
    </div>
  );
};

export default OperacionChecklist;
