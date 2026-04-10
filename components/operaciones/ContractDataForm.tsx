"use client";

import { useState } from "react";
import { Lock, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  ContractData,
  OperacionViewerRole,
} from "@/lib/mock/operaciones-types";

interface ContractDataFormProps {
  formData: ContractData;
  onChange: (key: keyof ContractData, value: string) => void;
  onSave?: () => void;
  role: OperacionViewerRole;
}

// Which fields each role can edit
const editableByRole: Record<OperacionViewerRole, (keyof ContractData)[]> = {
  inquilino: [
    "tenantAddress",
    "tenantCuit",
  ],
  propietario: [
    "ownerAddress",
    "ownerCuit",
  ],
  hoggax: [],
  admin: [
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
  ],
};

const fieldLabels: Record<string, string> = {
  tenantFullName: "Nombre completo",
  tenantDni: "DNI",
  tenantEmail: "Email",
  tenantPhone: "Teléfono",
  tenantAddress: "Domicilio",
  tenantCuit: "CUIT/CUIL",
  ownerFullName: "Nombre completo",
  ownerDni: "DNI",
  ownerEmail: "Email",
  ownerPhone: "Teléfono",
  ownerAddress: "Domicilio",
  ownerCuit: "CUIT/CUIL",
  propertyAddress: "Dirección del inmueble",
  monthlyRent: "Alquiler mensual",
  currency: "Moneda",
  depositAmount: "Depósito",
  contractDurationMonths: "Duración (meses)",
  startDate: "Fecha de inicio",
  adjustmentType: "Tipo de ajuste",
  guaranteeType: "Garantía",
};

type FieldDef = {
  key: keyof ContractData;
  label: string;
};

const tenantFields: FieldDef[] = [
  { key: "tenantFullName", label: fieldLabels.tenantFullName },
  { key: "tenantDni", label: fieldLabels.tenantDni },
  { key: "tenantEmail", label: fieldLabels.tenantEmail },
  { key: "tenantPhone", label: fieldLabels.tenantPhone },
  { key: "tenantAddress", label: fieldLabels.tenantAddress },
  { key: "tenantCuit", label: fieldLabels.tenantCuit },
];

const ownerFields: FieldDef[] = [
  { key: "ownerFullName", label: fieldLabels.ownerFullName },
  { key: "ownerDni", label: fieldLabels.ownerDni },
  { key: "ownerEmail", label: fieldLabels.ownerEmail },
  { key: "ownerPhone", label: fieldLabels.ownerPhone },
  { key: "ownerAddress", label: fieldLabels.ownerAddress },
  { key: "ownerCuit", label: fieldLabels.ownerCuit },
];

const rentalFields: FieldDef[] = [
  { key: "propertyAddress", label: fieldLabels.propertyAddress },
  { key: "monthlyRent", label: fieldLabels.monthlyRent },
  { key: "currency", label: fieldLabels.currency },
  { key: "depositAmount", label: fieldLabels.depositAmount },
  { key: "contractDurationMonths", label: fieldLabels.contractDurationMonths },
  { key: "startDate", label: fieldLabels.startDate },
  { key: "adjustmentType", label: fieldLabels.adjustmentType },
  { key: "guaranteeType", label: fieldLabels.guaranteeType },
];

const ContractDataForm = ({
  formData,
  onChange,
  onSave,
  role,
}: ContractDataFormProps) => {
  const [saved, setSaved] = useState(false);
  const editable = editableByRole[role];

  const handleChange = (key: keyof ContractData, value: string) => {
    onChange(key, value);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSave?.();
  };

  const renderField = ({ key, label }: FieldDef) => {
    const isEditable = editable.includes(key);
    const value = String(formData[key] ?? "");
    const isEmpty = !value;

    return (
      <div key={key} className="space-y-1">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          {label}
          {!isEditable && <Lock className="h-3 w-3" />}
        </Label>
        <Input
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          disabled={!isEditable}
          className={cn(
            "h-9 text-sm",
            !isEditable && "bg-muted/50 cursor-not-allowed",
            isEmpty && isEditable && "border-warning/50"
          )}
          placeholder={isEmpty ? "Completar..." : ""}
        />
      </div>
    );
  };

  const renderSection = (title: string, fields: FieldDef[]) => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map(renderField)}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 bg-card rounded-lg border border-border p-4">
      {renderSection("Datos del inquilino", tenantFields)}
      <Separator />
      {renderSection("Datos del propietario", ownerFields)}
      <Separator />
      {renderSection("Datos del alquiler", rentalFields)}

      {editable.length > 0 && (
        <Button
          onClick={handleSave}
          className="w-full h-10"
          variant={saved ? "outline" : "default"}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              Guardado
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" />
              Guardar datos
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ContractDataForm;
