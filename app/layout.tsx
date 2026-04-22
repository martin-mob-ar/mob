import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { getAuthUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { InitialAuthUser } from "@/contexts/AuthContext";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar"
  ),
  title: {
    default: "Mob - Alquileres 100% online en Argentina",
    template: "%s | Mob",
  },
  description:
    "Alquila de forma digital y segura. Departamentos, casas y PH verificados en CABA y GBA. Visitas, reservas, contratos y garantia 100% online.",
  openGraph: {
    type: "website",
    siteName: "Mob",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isStudio = pathname.startsWith("/studio");

  // Skip auth resolution for Studio — it handles its own auth
  if (isStudio) {
    return (
      <html lang="es">
        <body style={{ margin: 0 }}>{children}</body>
      </html>
    );
  }

  // Resolve auth user server-side so the client AuthProvider can skip
  // the loading skeleton on initial render for authenticated users.
  const authUser = await getAuthUser();

  let initialUser: InitialAuthUser | null = null;
  if (authUser) {
    const { data: publicUser } = await supabaseAdmin
      .from("users")
      .select("id, name, telefono, telefono_country_code, truora_document_verified, hoggax_approved, hoggax_max_rent_plus_expenses, account_type, logo")
      .eq("id", authUser.id)
      .maybeSingle();

    const isInmobiliaria = publicUser?.account_type === 3 || publicUser?.account_type === 4;

    initialUser = {
      email: authUser.email || "",
      name:
        publicUser?.name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "",
      phone: publicUser?.telefono || "",
      phoneCountryCode: publicUser?.telefono_country_code || "+54",
      // Derive isOwner from DB account_type (3 = inmobiliaria, 4 = red inmobiliaria), fall back to signup metadata
      isOwner: publicUser
        ? isInmobiliaria
        : (authUser.user_metadata?.isOwner ?? false),
      accountType: publicUser?.account_type ?? null,
      publicUserId: publicUser?.id ?? null,
      isVerified: !!publicUser?.truora_document_verified && !!publicUser?.hoggax_approved,
      avatarUrl: isInmobiliaria
        ? (publicUser?.logo || null)
        : (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null),
    };
  }

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://storage.googleapis.com" />
        <link rel="preconnect" href="https://cdn.sanity.io" />
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`,
            }}
          />
        )}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");`,
            }}
          />
        )}
      </head>
      <body>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
