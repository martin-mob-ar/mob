"use client";

import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import TrustBadges from "@/components/TrustBadges";
import PropertySection from "@/components/PropertySection";
import WhyMob from "@/components/WhyMob";
import ExploreRentals from "@/components/ExploreRentals";
import Footer from "@/components/Footer";
import { properties as mockProperties } from "@/data/properties";
import { Property } from "@/components/PropertyCard";
import { usePropertyPhotos } from "@/hooks/usePropertyPhotos";

interface IndexProps {
  properties?: Property[];
}

const Index = ({ properties }: IndexProps) => {
  const displayProperties = properties && properties.length > 0 ? properties : mockProperties;
  const enrichedProperties = usePropertyPhotos(displayProperties);

  return <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-8 md:py-[45px] shadow-none opacity-100">
        <div className="container px-4 md:px-8 max-w-full">
          <div className="text-center mb-6 md:mb-10">
            <h1 className="font-display text-2xl md:text-5xl font-bold mb-2">
              <span className="text-primary">Alquilá fácil.</span>{" "}
              <span className="text-foreground">100% online.</span>
            </h1>
            <p className="hidden md:block text-muted-foreground text-base md:text-lg mt-3 md:mt-4 max-w-xl mx-auto px-4 md:px-0">Encontrá tu próximo hogar de manera digital y costos menores</p>
          </div>

          <div className="flex justify-center w-full">
            <SearchBar />
          </div>

          <div className="mt-6 md:mt-8">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* Properties Sections */}
      <div className="-mt-6">
        <PropertySection title="Propiedades para vos" properties={enrichedProperties} />
      </div>

      <PropertySection title="Últimas propiedades" properties={[...enrichedProperties].reverse()} />

      {/* Why MOB Section */}
      <WhyMob />

      {/* Explore Rentals Section */}
      <ExploreRentals />

      <Footer />
    </div>;
};
export default Index;
