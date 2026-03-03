import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthUser } from "@/lib/supabase/auth";
import SubirPropiedad from "@/views/SubirPropiedad";

export default async function SubirPropiedadPage() {
  const user = await getAuthUser();

  if (!user) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/subir-propiedad";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  return <SubirPropiedad userId={user.id} />;
}
