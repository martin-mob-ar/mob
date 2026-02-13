import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server-component";
import PanelLayout from "@/views/panel/PanelLayout";

export default async function GestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <PanelLayout>{children}</PanelLayout>;
}
