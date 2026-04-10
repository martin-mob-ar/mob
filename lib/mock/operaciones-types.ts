// ─── Viewer roles ───────────────────────────────────────────────────
export type OperacionViewerRole = "inquilino" | "propietario" | "hoggax" | "admin";

// ─── Checklist step statuses ────────────────────────────────────────
export type ChecklistStepStatus = "completed" | "in_progress" | "pending";

// ─── Document statuses ──────────────────────────────────────────────
export type DocumentStatus = "pendiente" | "subido" | "aprobado" | "rechazado";

// ─── Documentation sub-stages ───────────────────────────────────────
export type DocumentacionSubStage =
  | "esperando_inquilino"
  | "esperando_aprobacion"
  | "aprobada";

// ─── ZapSign signature stages ───────────────────────────────────────
export type FirmaStage =
  | "pendiente"
  | "enviado_propietario"
  | "firmado_propietario"
  | "enviado_inquilino"
  | "firmado_inquilino"
  | "documento_final";

// ─── Document item ──────────────────────────────────────────────────
export interface OperacionDocument {
  id: string;
  name: string;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
  rejectionComment?: string;
  preloaded?: boolean;
}

// ─── Checklist step ─────────────────────────────────────────────────
export interface ChecklistStep {
  id: string;
  order: number;
  title: string;
  status: ChecklistStepStatus;
  description?: string;
  // Step-specific
  documentacionSubStage?: DocumentacionSubStage;
  documents?: OperacionDocument[];
  firmaStage?: FirmaStage;
}

// ─── Contract data ──────────────────────────────────────────────────
export interface ContractData {
  // Inquilino
  tenantFullName: string;
  tenantDni: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAddress: string;
  tenantCuit: string;
  // Propietario
  ownerFullName: string;
  ownerDni: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  ownerCuit: string;
  // Alquiler
  propertyAddress: string;
  monthlyRent: number;
  currency: string;
  depositAmount: number;
  contractDurationMonths: number;
  startDate: string;
  adjustmentType: string;
  guaranteeType: string;
}

// ─── Tenant verification data (from Truora verification flow) ──────
// In production this comes from the Supabase users table / Truora API
// response stored at verification time.
export type EmploymentSituation =
  | "relacion_dependencia"
  | "monotributista"
  | "responsable_inscripto"
  | "estudiante_universitario"
  | "jubilado";

export interface TenantVerificationData {
  fullName: string;
  dni: string;
  gender: "masculino" | "femenino" | "otro";
  employmentSituation: EmploymentSituation;
  jobTenureMonths: number;
  monthlyIncome: number;
  incomeCurrency: string;
}

// ─── Operation ──────────────────────────────────────────────────────
export type OperacionGeneralStatus = "en_proceso" | "completada" | "cancelada";

export interface Operacion {
  id: string;
  propertyAddress: string;
  propertyType: string;
  tenantName: string;
  tenantEmail: string;
  ownerName: string;
  ownerEmail: string;
  generalStatus: OperacionGeneralStatus;
  currentStepIndex: number;
  progressPercent: number;
  checklist: ChecklistStep[];
  contractData: ContractData;
  tenantVerification: TenantVerificationData;
  createdAt: string;
  updatedAt: string;
}
