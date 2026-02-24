import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthUser } from "@/lib/supabase/auth";
import PanelLayout from "@/views/panel/PanelLayout";

export default async function GestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/gestion";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  return <PanelLayout>{children}</PanelLayout>;
}
