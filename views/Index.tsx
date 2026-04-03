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

      <Footer />
    </div>;
};
export default Index;
