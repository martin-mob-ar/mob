import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server-component";
import { transformPropertyReadList } from "@/lib/transforms/property";
import { sanityFetch } from "@/lib/sanity/client";
import { latestPostsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import Index from "@/views/Index";
import FAQJsonLd from "@/components/seo/FAQJsonLd";

export const metadata: Metadata = {
  title: "Alquileres 100% online en Argentina",
  description:
    "Alquila de forma digital y segura. Departamentos, casas y PH verificados en CABA y GBA. Visitas, reservas, contratos y garantia 100% online. Sin comision inmobiliaria.",
  alternates: { canonical: "/" },
};

export default async function IndexPage() {
  let featuredProperties;
  let latestProperties;
  let latestPosts: Post[] = [];

  try {
    const supabase = await createClient();

    // Propiedades destacadas: premium plans first (acompanado/experiencia), then rest
    const { data: featured } = await supabase
      .from("properties_read")
      .select("*")
      .eq("owner_verified", true)
      .order("sort_priority", { ascending: true })
      .order("property_created_at", { ascending: false })
      .limit(6);

    // Últimas propiedades: simply newest first
    const { data: latest } = await supabase
      .from("properties_read")
      .select("*")
      .eq("owner_verified", true)
      .order("property_created_at", { ascending: false })
      .limit(6);

    if (featured && featured.length > 0) {
      featuredProperties = transformPropertyReadList(featured);
    }
    if (latest && latest.length > 0) {
      latestProperties = transformPropertyReadList(latest);
    }
  } catch {
    // Fall back to mock data if DB fetch fails
  }

  try {
    latestPosts = await sanityFetch<Post[]>({
      query: latestPostsQuery,
      params: { limit: 3 },
      tags: ["post"],
    });
  } catch {
    // Sanity unavailable — skip blog posts
  }

  return (
    <>
      <FAQJsonLd
        items={[
          { question: "¿Cómo funciona Mob?", answer: "Mob es una plataforma de alquileres 100% online. Publicás o buscás propiedades, coordinás visitas, verificamos a los interesados y gestionamos reservas, contratos digitales y cobros. Todo sin necesidad de ir a una oficina ni usar papel." },
          { question: "¿Es seguro alquilar por Mob?", answer: "Sí. Todos los interesados pasan por un proceso de verificación de identidad y capacidad de pago antes de poder avanzar. Además, trabajamos con Hoggax para ofrecer garantía de alquiler con descuento y cobro garantizado para propietarios." },
          { question: "¿En qué zonas operan?", answer: "Actualmente operamos en CABA, Gran Buenos Aires y las principales ciudades de Argentina. Estamos en constante expansión para cubrir más localidades del país." },
          { question: "¿Cuánto cuesta usar Mob?", answer: "Para inquilinos, buscar y visitar propiedades es completamente gratis. Para inmobiliarias y propietarios, publicar es gratis y solo se cobra un costo de plataforma cuando el alquiler se concreta. No hay costos iniciales ni cargos ocultos." },
        ]}
      />
      <Index featuredProperties={featuredProperties} latestProperties={latestProperties} latestPosts={latestPosts} />
    </>
  );
}
