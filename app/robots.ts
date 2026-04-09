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
          "/verificate",
          "/subir-propiedad",
          "/presentacion",
          "/presentacion2",
          "/presentacion3",
          "/post-venta",
          "/admin",
          "/operaciones/",
        ],
      },
      // Allow AI search bots explicitly (citation benefit)
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
      },
      // Block training-only crawlers (no citation benefit)
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${APP_URL}/sitemap-index.xml`,
  };
}
