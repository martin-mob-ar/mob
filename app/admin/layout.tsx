import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";
import { ADMIN_AUTH_IDS } from "@/lib/constants/admin-users";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user || !ADMIN_AUTH_IDS.includes(user.id)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="mx-auto max-w-[1400px] p-6">{children}</main>
    </div>
  );
}
