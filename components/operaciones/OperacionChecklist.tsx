"use client";

import { useState } from "react";
import type {
  ContractData,
  DocumentStatus,
  Operacion,
  OperacionViewerRole,
} from "@/lib/mock/operaciones-types";
import ChecklistStep from "./ChecklistStep";
import DocumentacionPanel from "./DocumentacionPanel";
import ContractDataForm from "./ContractDataForm";
import FirmaTimeline from "./FirmaTimeline";
import TenantVerificationPanel from "./TenantVerificationPanel";
import PagoPanel from "./PagoPanel";

interface OperacionChecklistProps {
  operation: Operacion;
  role: OperacionViewerRole;
}

// Fields that must all be filled for step 5 to be considered complete.
const requiredContractFields: (keyof ContractData)[] = [
  "tenantFullName",
  "tenantDni",
  "tenantEmail",
  "tenantPhone",
  "tenantAddress",
  "tenantCuit",
  "ownerFullName",
  "ownerDni",
  "ownerEmail",
  "ownerPhone",
  "ownerAddress",
  "ownerCuit",
  "propertyAddress",
  "monthlyRent",
  "currency",
  "depositAmount",
  "contractDurationMonths",
  "startDate",
  "adjustmentType",
  "guaranteeType",
];

const OperacionChecklist = ({ operation, role }: OperacionChecklistProps) => {
  // Auto-expand the active step
  const [expandedStep, setExpandedStep] = useState<string | null>(() => {
    const active = operation.checklist.find((s) => s.status === "in_progress");
    return active?.id ?? null;
  });

  // Contract form state (lifted from ContractDataForm so we can compute
  // whether step 5 is complete).
  const [contractForm, setContractForm] = useState<ContractData>({
    ...operation.contractData,
  });

  // Document statuses (lifted from DocumentRow so we can detect when
  // every document has been approved and auto-advance to the next step).
  const step2 = operation.checklist.find((s) => s.order === 2);
  const step2Docs = step2?.documents ?? [];
  const [docStatuses, setDocStatuses] = useState<Record<string, DocumentStatus>>(
    () => Object.fromEntries(step2Docs.map((d) => [d.id, d.status]))
  );

  // Step 3 payment state. Initialised from the mock data (completed if the
  // mock operation is already past step 3).
  const step3 = operation.checklist.find((s) => s.order === 3);
  const [isPaid, setIsPaid] = useState<boolean>(
    step3?.status === "completed"
  );

  const toggleStep = (stepId: string) => {
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  };

  const handleContractChange = (
    key: keyof ContractData,
    value: string
  ) => {
    setContractForm((prev) => ({ ...prev, [key]: value }));
  };

  // When the user clicks "Guardar datos" in step 5 and every required
  // field is filled, collapse step 5 and expand step 6.
  const handleContractSave = () => {
    if (!contractAllFilled) return;
    const step6 = operation.checklist.find((s) => s.order === 6);
    if (step6) setExpandedStep(step6.id);
  };

  // When a document status changes (e.g. Hoggax approves a file), update
  // local state. If every document is now approved, collapse step 2 and
  // expand step 3 automatically.
  const handleDocStatusChange = (docId: string, status: DocumentStatus) => {
    setDocStatuses((prev) => {
      const next = { ...prev, [docId]: status };
      const allApproved =
        step2Docs.length > 0 &&
        step2Docs.every((d) => (next[d.id] ?? d.status) === "aprobado");
      if (allApproved && step3) setExpandedStep(step3.id);
      return next;
    });
  };

  // When Hoggax/admin registers the payment, mark step 3 as complete
  // and auto-advance to step 4.
  const handleRegisterPayment = () => {
    setIsPaid(true);
    const step4 = operation.checklist.find((s) => s.order === 4);
    if (step4) setExpandedStep(step4.id);
  };

  const canSeeVerificationData = role === "admin" || role === "hoggax";

  // Check if every required field has a non-empty value.
  const contractAllFilled = requiredContractFields.every((key) => {
    const v = contractForm[key];
    if (typeof v === "number") return v > 0;
    return typeof v === "string" && v.trim().length > 0;
  });

  // Check if every step-2 document is approved (using current statuses).
  const allDocsApproved =
    step2Docs.length > 0 &&
    step2Docs.every((d) => (docStatuses[d.id] ?? d.status) === "aprobado");

  return (
    <div className="space-y-0">
      {operation.checklist.map((step, idx) => {
        const isLast = idx === operation.checklist.length - 1;
        const isExpanded = expandedStep === step.id;

        // Dynamic title for step 2: "Documentación" by default,
        // "Documentación aprobada" only when all docs are approved.
        let displayStep = step;
        if (step.order === 2) {
          displayStep = {
            ...step,
            title: allDocsApproved ? "Documentación aprobada" : "Documentación",
            status: allDocsApproved ? "completed" : step.status,
          };
        }

        // Step 3: "Pago garantía" by default, "Pago garantía realizado"
        // once completed.
        if (step.order === 3) {
          displayStep = {
            ...displayStep,
            title: isPaid ? "Pago garantía realizado" : "Pago garantía",
            status: isPaid ? "completed" : step.status,
          };
        }

        // Step 5: mark as completed when all contract fields are filled.
        if (step.order === 5 && contractAllFilled && step.status !== "completed") {
          displayStep = { ...displayStep, status: "completed" };
        }

        return (
          <ChecklistStep
            key={step.id}
            step={displayStep}
            isLast={isLast}
            isExpanded={isExpanded}
            onToggle={() => toggleStep(step.id)}
          >
            {/* Step 1: Tenant verification data (admin/hoggax only) */}
            {step.order === 1 && canSeeVerificationData && (
              <TenantVerificationPanel data={operation.tenantVerification} />
            )}

            {/* Step 2: Documentación */}
            {step.order === 2 && step.documents && step.documents.length > 0 && (
              <DocumentacionPanel
                step={step}
                role={role}
                docStatuses={docStatuses}
                onDocStatusChange={handleDocStatusChange}
              />
            )}

            {/* Step 3: Pago garantía (hoggax / admin only) */}
            {step.order === 3 && (role === "hoggax" || role === "admin") && (
              <PagoPanel isPaid={isPaid} onRegister={handleRegisterPayment} />
            )}

            {/* Step 5: Datos de contrato */}
            {step.order === 5 && (
              <ContractDataForm
                formData={contractForm}
                onChange={handleContractChange}
                onSave={handleContractSave}
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
          </ChecklistStep>
        );
      })}
    </div>
  );
};

export default OperacionChecklist;
