import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/studio",
          "/api/",
          "/gestion/",
          "/gestion-inmobiliaria/",
          "/reserva/",
          "/visita/",
          "/perfil/",
          "/login",
          "/onboarding/",
          "/mis-busquedas",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
