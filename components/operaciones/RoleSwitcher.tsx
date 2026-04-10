"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OperacionViewerRole } from "@/lib/mock/operaciones-types";

interface RoleSwitcherProps {
  operationId: string;
  currentRole: OperacionViewerRole;
}

const roles: { value: OperacionViewerRole; label: string }[] = [
  { value: "hoggax", label: "Hoggax" },
  { value: "admin", label: "Admin" },
  { value: "inquilino", label: "Inquilino" },
  { value: "propietario", label: "Propietario" },
];

const RoleSwitcher = ({ operationId, currentRole }: RoleSwitcherProps) => {
  return (
    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
        <Eye className="h-3 w-3" />
        Vista demo — cambiar rol
      </div>
      <div className="flex gap-1 bg-background/60 rounded-lg p-1">
        {roles.map((role) => {
          const isActive = role.value === currentRole;
          return (
            <Link
              key={role.value}
              href={`/operaciones/${operationId}?role=${role.value}`}
              className={cn(
                "flex-1 text-center text-xs font-medium px-2 py-1.5 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {role.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSwitcher;
