import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mob - Alquileres 100% online",
    short_name: "Mob",
    description:
      "Alquila de forma digital y segura. Departamentos, casas y PH verificados en CABA y GBA.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/favicon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
