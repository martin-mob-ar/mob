import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server-component";
import InmobiliariaPanelLayout from "@/views/panel-inmobiliaria/InmobiliariaPanelLayout";

export default async function GestionInmobiliariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <InmobiliariaPanelLayout>{children}</InmobiliariaPanelLayout>;
}
