"use client";

import { UserRound, Home, Building2 } from "lucide-react";

const ACCOUNT_TYPES = [
  {
    id: 1,
    label: "Soy inquilino",
    icon: UserRound,
    description: "Busco propiedades para alquilar",
  },
  {
    id: 2,
    label: "Soy dueño directo",
    icon: Home,
    description: "Tengo propiedades para alquilar",
  },
  {
    id: 3,
    label: "Soy inmobiliaria",
    icon: Building2,
    description: "Gestiono propiedades de clientes",
  },
];

interface AccountTypeSelectorProps {
  onSelect: (type: number) => void;
  loading?: boolean;
}

export default function AccountTypeSelector({
  onSelect,
  loading,
}: AccountTypeSelectorProps) {
  return (
    <div className="space-y-3">
      {ACCOUNT_TYPES.map((type) => {
        const Icon = type.icon;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => !loading && onSelect(type.id)}
            disabled={loading}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{type.label}</div>
              <div className="text-sm text-muted-foreground">{type.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
