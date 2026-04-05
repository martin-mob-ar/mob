const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export default function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mob",
    url: APP_URL,
    logo: `${APP_URL}/assets/mob-logo-new.png`,
    description:
      "Plataforma de alquileres 100% online en Argentina. Visitas, reservas, contratos digitales y garantia con descuento.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hola@mob.ar",
    },
    sameAs: ["https://instagram.com/mob.alquileres"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
