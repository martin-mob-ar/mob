"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertySection from "@/components/PropertySection";
import Timeline from "@/components/Timeline";
import BentoGrid from "@/components/BentoGrid";
import WhyMob from "@/components/WhyMob";
import DualCTA from "@/components/DualCTA";
import ExploreRentals from "@/components/ExploreRentals";
import Footer from "@/components/Footer";
import LatestPosts from "@/components/blog/LatestPosts";
import { properties as mockProperties } from "@/data/properties";
import { Property } from "@/components/PropertyCard";
import { usePropertyPhotos } from "@/hooks/usePropertyPhotos";
import type { Post } from "@/lib/sanity/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface IndexProps {
  featuredProperties?: Property[];
  latestProperties?: Property[];
  latestPosts?: Post[];
}

const Index = ({ featuredProperties, latestProperties, latestPosts }: IndexProps) => {
  const displayFeatured = featuredProperties && featuredProperties.length > 0 ? featuredProperties : mockProperties;
  const displayLatest = latestProperties && latestProperties.length > 0 ? latestProperties : mockProperties;
  const enrichedFeatured = usePropertyPhotos(displayFeatured);
  const enrichedLatest = usePropertyPhotos(displayLatest);

  return <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Properties Sections */}
      <PropertySection title="Propiedades destacadas" properties={enrichedFeatured} />

      <PropertySection title="Últimas propiedades" properties={enrichedLatest} />

      {/* How it works */}
      <Timeline />

      {/* Feature Showcase */}
      <BentoGrid />

      {/* Propuesta MOB */}
      <WhyMob />

      {/* Dual CTA - Propietarios & Inmobiliarias */}
      <DualCTA />

      {/* Explore Rentals Section */}
      <ExploreRentals />

      {/* Latest Blog Posts */}
      {latestPosts && latestPosts.length > 0 && (
        <LatestPosts posts={latestPosts} />
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 text-foreground">
            Preguntas frecuentes
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: "¿Cómo funciona Mob?",
                a: "Mob es una plataforma de alquileres 100% online. Publicás o buscás propiedades, coordinás visitas, verificamos a los interesados y gestionamos reservas, contratos digitales y cobros. Todo sin necesidad de ir a una oficina ni usar papel.",
              },
              {
                q: "¿Es seguro alquilar por Mob?",
                a: "Sí. Todos los interesados pasan por un proceso de verificación de identidad y capacidad de pago antes de poder avanzar. Además, trabajamos con Hoggax para ofrecer garantía de alquiler con descuento y cobro garantizado para propietarios.",
              },
              {
                q: "¿En qué zonas operan?",
                a: "Actualmente operamos en CABA, Gran Buenos Aires y las principales ciudades de Argentina. Estamos en constante expansión para cubrir más localidades del país.",
              },
              {
                q: "¿Cuánto cuesta usar Mob?",
                a: "Para inquilinos, buscar y visitar propiedades es completamente gratis. Para inmobiliarias y propietarios, publicar es gratis y solo se cobra un costo de plataforma cuando el alquiler se concreta. No hay costos iniciales ni cargos ocultos.",
              },
            ].map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-xl px-6 bg-card data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="text-[15px] font-semibold text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;
