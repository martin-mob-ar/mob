import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthUser } from "@/lib/supabase/auth";
import InmobiliariaPanelLayout from "@/views/panel-inmobiliaria/InmobiliariaPanelLayout";

export default async function GestionInmobiliariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/gestion-inmobiliaria";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  return <InmobiliariaPanelLayout>{children}</InmobiliariaPanelLayout>;
}
