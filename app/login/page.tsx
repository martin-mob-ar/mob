import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect;

  // Protected pages (/gestion*, /gestion-inmobiliaria*) would re-redirect
  // if we send an unauthenticated user there, so open the modal on home
  // and pass the intended destination as ?redirect= for post-login navigation.
  const isProtected =
    redirectTo?.startsWith("/gestion") ||
    redirectTo?.startsWith("/gestion-inmobiliaria") ||
    redirectTo?.startsWith("/perfil");

  if (isProtected) {
    redirect(`/?auth=open&redirect=${encodeURIComponent(redirectTo!)}`);
  }

  // Public pages — redirect directly with auth=open
  const target = redirectTo || "/";
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}auth=open`);
}
