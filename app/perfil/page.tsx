import { getAuthUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi perfil | mob",
};

export default async function PerfilPage() {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/login?redirect=/perfil");
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("name, email, telefono, telefono_area, telefono_country_code")
    .eq("auth_id", authUser.id)
    .single();

  if (!profile) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-8 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Inicio
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Mi perfil</h1>
          <p className="text-muted-foreground mt-1">Editá tu información personal</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <ProfileForm profile={profile} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
