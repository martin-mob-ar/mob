import { redirect } from "next/navigation";
import { getMockOperation } from "@/lib/mock/operaciones-mock-data";
import OperacionDetailView from "@/views/operaciones/OperacionDetailView";
import type { OperacionViewerRole } from "@/lib/mock/operaciones-types";

interface Props {
  params: Promise<{ operationId: string }>;
  searchParams: Promise<{ role?: string }>;
}

export default async function OperacionDetailPage({
  params,
  searchParams,
}: Props) {
  const { operationId } = await params;
  const { role = "inquilino" } = await searchParams;

  const operation = getMockOperation(operationId);
  if (!operation) redirect("/operaciones");

  const validRoles: OperacionViewerRole[] = [
    "inquilino",
    "propietario",
    "hoggax",
    "admin",
  ];
  const viewerRole: OperacionViewerRole = validRoles.includes(
    role as OperacionViewerRole
  )
    ? (role as OperacionViewerRole)
    : "inquilino";

  return <OperacionDetailView operation={operation} role={viewerRole} />;
}
