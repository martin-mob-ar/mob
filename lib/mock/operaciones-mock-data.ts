import type {
  Operacion,
  ChecklistStep,
  OperacionDocument,
  ContractData,
} from "./operaciones-types";

// ─── Helper: build a 6-step checklist ───────────────────────────────

function buildChecklist(
  activeStep: number,
  overrides?: Partial<Record<number, Partial<ChecklistStep>>>
): ChecklistStep[] {
  const steps: ChecklistStep[] = [
    {
      id: "step-1",
      order: 1,
      title: "Garantía aprobada",
      status: "completed",
      description: "La garantía fue pre-aprobada por Hoggax.",
    },
    {
      id: "step-2",
      order: 2,
      title: "Documentación aprobada",
      status: "pending",
      documentacionSubStage: "esperando_inquilino",
      documents: [],
    },
    {
      id: "step-3",
      order: 3,
      title: "Pago realizado",
      status: "pending",
    },
    {
      id: "step-4",
      order: 4,
      title: "Garantía lista para emitir",
      status: "pending",
    },
    {
      id: "step-5",
      order: 5,
      title: "Llenar datos de contrato",
      status: "pending",
    },
    {
      id: "step-6",
      order: 6,
      title: "Firma del contrato",
      status: "pending",
      firmaStage: "pendiente",
    },
  ];

  // Mark steps before activeStep as completed, activeStep as in_progress
  for (let i = 0; i < steps.length; i++) {
    if (i + 1 < activeStep) steps[i].status = "completed";
    else if (i + 1 === activeStep) steps[i].status = "in_progress";
    else steps[i].status = "pending";
  }

  // Apply overrides
  if (overrides) {
    for (const [stepNum, override] of Object.entries(overrides)) {
      const idx = Number(stepNum) - 1;
      if (steps[idx]) Object.assign(steps[idx], override);
    }
  }

  return steps;
}

// ─── Shared documents ───────────────────────────────────────────────

const docsWaitingUpload: OperacionDocument[] = [
  {
    id: "doc-1",
    name: "DNI (frente y dorso)",
    status: "aprobado",
    fileName: "dni-frente-dorso.pdf",
    fileUrl: "#",
    uploadedAt: "2026-04-01",
    preloaded: true,
  },
  {
    id: "doc-2",
    name: "Recibos de sueldo (últimos 3)",
    status: "pendiente",
  },
  {
    id: "doc-3",
    name: "Certificado de empleo",
    status: "pendiente",
  },
];

const docsWithRejection: OperacionDocument[] = [
  {
    id: "doc-1",
    name: "DNI (frente y dorso)",
    status: "aprobado",
    fileName: "dni-frente-dorso.pdf",
    fileUrl: "#",
    uploadedAt: "2026-03-28",
    preloaded: true,
  },
  {
    id: "doc-2",
    name: "Recibos de sueldo (últimos 3)",
    status: "rechazado",
    fileName: "recibos-sueldo.pdf",
    fileUrl: "#",
    uploadedAt: "2026-04-02",
    rejectionComment: "Los recibos están borrosos, por favor subir nuevamente en mejor calidad.",
  },
  {
    id: "doc-3",
    name: "Certificado de empleo",
    status: "subido",
    fileName: "certificado-empleo.pdf",
    fileUrl: "#",
    uploadedAt: "2026-04-03",
  },
];

const docsAllApproved: OperacionDocument[] = [
  {
    id: "doc-1",
    name: "DNI (frente y dorso)",
    status: "aprobado",
    fileName: "dni-frente-dorso.pdf",
    fileUrl: "#",
    uploadedAt: "2026-03-15",
    preloaded: true,
  },
  {
    id: "doc-2",
    name: "Recibos de sueldo (últimos 3)",
    status: "aprobado",
    fileName: "recibos-marzo.pdf",
    fileUrl: "#",
    uploadedAt: "2026-03-18",
  },
  {
    id: "doc-3",
    name: "Certificado de empleo",
    status: "aprobado",
    fileName: "certificado.pdf",
    fileUrl: "#",
    uploadedAt: "2026-03-18",
  },
];

// ─── Contract data templates ────────────────────────────────────────

const contractBase: ContractData = {
  tenantFullName: "Lucía Fernández",
  tenantDni: "35.456.789",
  tenantEmail: "lucia.fernandez@email.com",
  tenantPhone: "+54 11 5555-1234",
  tenantAddress: "",
  tenantCuit: "",
  ownerFullName: "Carlos Méndez",
  ownerDni: "28.123.456",
  ownerEmail: "carlos.mendez@email.com",
  ownerPhone: "+54 11 4444-5678",
  ownerAddress: "",
  ownerCuit: "",
  propertyAddress: "Av. Córdoba 1234, Piso 4 B, CABA",
  monthlyRent: 850,
  currency: "USD",
  depositAmount: 1700,
  contractDurationMonths: 24,
  startDate: "2026-05-01",
  adjustmentType: "ICL trimestral",
  guaranteeType: "Hoggax",
};

const contractFilled: ContractData = {
  ...contractBase,
  tenantAddress: "Av. Santa Fe 2200, 3A, CABA",
  tenantCuit: "20-35456789-1",
  ownerAddress: "Juncal 1500, PB, CABA",
  ownerCuit: "20-28123456-3",
};

// ─── Mock operations ────────────────────────────────────────────────

const mockOperaciones: Record<string, Operacion> = {
  "op-001": {
    id: "op-001",
    propertyAddress: "Av. Córdoba 1234, Piso 4 B, CABA",
    propertyType: "Departamento",
    tenantName: "Lucía Fernández",
    tenantEmail: "lucia.fernandez@email.com",
    ownerName: "Carlos Méndez",
    ownerEmail: "carlos.mendez@email.com",
    generalStatus: "en_proceso",
    currentStepIndex: 2,
    progressPercent: 17,
    checklist: buildChecklist(2, {
      2: {
        documentacionSubStage: "esperando_inquilino",
        documents: docsWaitingUpload,
      },
    }),
    contractData: contractBase,
    createdAt: "2026-04-01",
    updatedAt: "2026-04-08",
  },

  "op-002": {
    id: "op-002",
    propertyAddress: "Thames 1800, Palermo, CABA",
    propertyType: "PH",
    tenantName: "Martín Rodríguez",
    tenantEmail: "martin.r@email.com",
    ownerName: "Ana Gutiérrez",
    ownerEmail: "ana.gutierrez@email.com",
    generalStatus: "en_proceso",
    currentStepIndex: 2,
    progressPercent: 17,
    checklist: buildChecklist(2, {
      2: {
        documentacionSubStage: "esperando_aprobacion",
        documents: docsWithRejection,
      },
    }),
    contractData: {
      ...contractBase,
      tenantFullName: "Martín Rodríguez",
      tenantDni: "37.890.123",
      tenantEmail: "martin.r@email.com",
      tenantPhone: "+54 11 5555-2345",
      ownerFullName: "Ana Gutiérrez",
      ownerDni: "30.456.789",
      ownerEmail: "ana.gutierrez@email.com",
      ownerPhone: "+54 11 4444-6789",
      propertyAddress: "Thames 1800, Palermo, CABA",
      monthlyRent: 950,
      depositAmount: 1900,
    },
    createdAt: "2026-03-25",
    updatedAt: "2026-04-07",
  },

  "op-003": {
    id: "op-003",
    propertyAddress: "Av. Libertador 5000, Núñez, CABA",
    propertyType: "Departamento",
    tenantName: "Sofía Ramos",
    tenantEmail: "sofia.ramos@email.com",
    ownerName: "Roberto Pérez",
    ownerEmail: "roberto.perez@email.com",
    generalStatus: "en_proceso",
    currentStepIndex: 5,
    progressPercent: 67,
    checklist: buildChecklist(5, {
      2: {
        documentacionSubStage: "aprobada",
        documents: docsAllApproved,
      },
    }),
    contractData: {
      ...contractBase,
      tenantFullName: "Sofía Ramos",
      tenantDni: "36.789.012",
      tenantEmail: "sofia.ramos@email.com",
      tenantPhone: "+54 11 5555-5678",
      tenantAddress: "Cabildo 3200, 7C, CABA",
      tenantCuit: "27-36789012-5",
      ownerFullName: "Roberto Pérez",
      ownerDni: "25.678.901",
      ownerEmail: "roberto.perez@email.com",
      ownerPhone: "+54 11 4444-1234",
      ownerAddress: "",
      ownerCuit: "",
      propertyAddress: "Av. Libertador 5000, Núñez, CABA",
      monthlyRent: 1200,
      depositAmount: 2400,
      contractDurationMonths: 36,
    },
    createdAt: "2026-03-10",
    updatedAt: "2026-04-06",
  },

  "op-004": {
    id: "op-004",
    propertyAddress: "Juncal 900, Retiro, CABA",
    propertyType: "Departamento",
    tenantName: "Diego Torres",
    tenantEmail: "diego.t@email.com",
    ownerName: "Valentina Cruz",
    ownerEmail: "valentina.c@email.com",
    generalStatus: "en_proceso",
    currentStepIndex: 6,
    progressPercent: 83,
    checklist: buildChecklist(6, {
      2: {
        documentacionSubStage: "aprobada",
        documents: docsAllApproved,
      },
      6: {
        firmaStage: "firmado_propietario",
      },
    }),
    contractData: {
      ...contractFilled,
      tenantFullName: "Diego Torres",
      tenantDni: "38.012.345",
      tenantEmail: "diego.t@email.com",
      tenantPhone: "+54 11 5555-4567",
      tenantAddress: "Av. Callao 800, 5D, CABA",
      tenantCuit: "20-38012345-7",
      ownerFullName: "Valentina Cruz",
      ownerDni: "29.345.678",
      ownerEmail: "valentina.c@email.com",
      ownerPhone: "+54 11 4444-9012",
      ownerAddress: "Montevideo 1200, 2A, CABA",
      ownerCuit: "27-29345678-9",
      propertyAddress: "Juncal 900, Retiro, CABA",
      monthlyRent: 750,
      depositAmount: 1500,
    },
    createdAt: "2026-02-20",
    updatedAt: "2026-04-05",
  },

  "op-005": {
    id: "op-005",
    propertyAddress: "Defensa 1100, San Telmo, CABA",
    propertyType: "PH",
    tenantName: "Carolina Méndez",
    tenantEmail: "carolina.m@email.com",
    ownerName: "Pablo Gutiérrez",
    ownerEmail: "pablo.g@email.com",
    generalStatus: "completada",
    currentStepIndex: 6,
    progressPercent: 100,
    checklist: buildChecklist(7, {
      2: {
        documentacionSubStage: "aprobada",
        documents: docsAllApproved,
      },
      6: {
        firmaStage: "documento_final",
      },
    }),
    contractData: {
      ...contractFilled,
      tenantFullName: "Carolina Méndez",
      tenantDni: "34.567.890",
      tenantEmail: "carolina.m@email.com",
      tenantPhone: "+54 11 5555-3456",
      tenantAddress: "Belgrano 2500, 10B, CABA",
      tenantCuit: "27-34567890-4",
      ownerFullName: "Pablo Gutiérrez",
      ownerDni: "31.234.567",
      ownerEmail: "pablo.g@email.com",
      ownerPhone: "+54 11 4444-6789",
      ownerAddress: "San Martín 400, PB, CABA",
      ownerCuit: "20-31234567-6",
      propertyAddress: "Defensa 1100, San Telmo, CABA",
      monthlyRent: 680,
      depositAmount: 1360,
      startDate: "2026-03-01",
    },
    createdAt: "2026-01-15",
    updatedAt: "2026-03-28",
  },
};

// ─── Getters ────────────────────────────────────────────────────────

export function getMockOperation(id: string): Operacion | null {
  return mockOperaciones[id] ?? null;
}

export function getMockAllOperations(): Operacion[] {
  return Object.values(mockOperaciones);
}
