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
      <HeroSection properties={enrichedProperties.slice(0, 4)} />

      {/* Properties Sections */}
      <PropertySection title="Propiedades destacadas" properties={enrichedProperties} />

      <PropertySection title="Últimas propiedades" properties={[...enrichedProperties].reverse()} />

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

      <Footer />
    </div>;
};
export default Index;
