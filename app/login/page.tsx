import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/";
  // Append auth=open so the AuthModal auto-opens on the target page
  const separator = redirectTo.includes("?") ? "&" : "?";
  redirect(`${redirectTo}${separator}auth=open`);
}
