"use client";

import { ShieldCheck, IdCard, Briefcase, Calendar, Wallet, UserCircle } from "lucide-react";
import type {
  EmploymentSituation,
  TenantVerificationData,
} from "@/lib/mock/operaciones-types";

interface TenantVerificationPanelProps {
  data: TenantVerificationData;
}

const genderLabels: Record<TenantVerificationData["gender"], string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  otro: "Otro",
};

const employmentSituationLabels: Record<EmploymentSituation, string> = {
  relacion_dependencia: "Relación de dependencia",
  monotributista: "Monotributista",
  responsable_inscripto: "Responsable Inscripto",
  estudiante_universitario: "Estudiante universitario",
  jubilado: "Jubilado/a",
};

function formatTenure(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) return `${years} ${years === 1 ? "año" : "años"}`;
  return `${years} ${years === 1 ? "año" : "años"} ${remaining} ${remaining === 1 ? "mes" : "meses"}`;
}

function formatIncome(amount: number, currency: string): string {
  const formatted = new Intl.NumberFormat("es-AR").format(amount);
  return `${currency} ${formatted}`;
}

const TenantVerificationPanel = ({ data }: TenantVerificationPanelProps) => {
  const rows: { icon: React.ElementType; label: string; value: string }[] = [
    {
      icon: UserCircle,
      label: "Nombre completo",
      value: data.fullName,
    },
    {
      icon: IdCard,
      label: "DNI",
      value: data.dni,
    },
    {
      icon: UserCircle,
      label: "Género",
      value: genderLabels[data.gender],
    },
    {
      icon: Briefcase,
      label: "Relación laboral",
      value: employmentSituationLabels[data.employmentSituation],
    },
    {
      icon: Calendar,
      label: "Antigüedad laboral",
      value: formatTenure(data.jobTenureMonths),
    },
    {
      icon: Wallet,
      label: "Ingresos mensuales",
      value: formatIncome(data.monthlyIncome, data.incomeCurrency),
    },
  ];

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-green-500/5 border-b border-border px-4 py-2.5 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-green-700">
            Datos verificados
          </p>
          <p className="text-[11px] text-muted-foreground">
            Información obtenida en el flujo de verificación Truora
          </p>
        </div>
      </div>

      {/* Data rows */}
      <dl className="divide-y divide-border">
        {rows.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="grid grid-cols-[auto_1fr] gap-3 px-4 py-2.5"
          >
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </dt>
            <dd className="text-sm font-medium text-right truncate">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default TenantVerificationPanel;
