import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthUser } from "@/lib/supabase/auth";

export default async function VerificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/verificate";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  return <>{children}</>;
}
