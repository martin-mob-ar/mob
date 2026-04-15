import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";
import { ADMIN_AUTH_IDS } from "@/lib/constants/admin-users";
import OperacionesLayout from "@/components/operaciones/OperacionesLayout";

export const metadata = {
  title: "Operaciones | Validación por Hoggax",
};

export default async function OperacionesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user || !ADMIN_AUTH_IDS.includes(user.id)) {
    redirect("/");
  }

  return <OperacionesLayout>{children}</OperacionesLayout>;
}
