"use client";

import SearchBar from "@/components/SearchBar";
import HeroCards from "@/components/HeroCards";
import HeroBadges from "@/components/HeroBadges";
import { Property } from "@/components/PropertyCard";

interface HeroSectionProps {
  properties: Property[];
}

const HeroSection = ({ properties }: HeroSectionProps) => {
  return (
    <section className="py-8 md:py-10 lg:py-12 overflow-visible">
      <div className="container px-4 md:px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
          {/* Left Side - Text + SearchBar */}
          <div className="flex-1 w-full lg:max-w-[55%] space-y-5 md:space-y-6 text-center lg:text-left lg:pt-16">
            <div>
              <h1 className="font-display text-3xl md:text-5xl lg:text-[3rem] font-bold leading-[1.1]">
                <span className="text-foreground">Alquilar ahora</span>
                <br />
                <span className="text-primary">es simple.</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg mt-4 md:mt-5 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Alquilá tu próximo hogar en nuestra plataforma con contratos digitales, agenda de visitas y garantía a mitad de precio.
              </p>
            </div>

            <div className="flex justify-center lg:justify-start w-full">
              <SearchBar />
            </div>

            {/* Mobile-only badges */}
            <div className="lg:hidden mt-4">
              <HeroBadges />
            </div>
          </div>

          {/* Right Side - Card + Badges (desktop only) */}
          <div className="hidden lg:block flex-1 relative min-h-[500px] max-w-[45%]">
            {/* Ambient glow behind cards */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: "50%",
                left: "50%",
                width: "480px",
                height: "480px",
                transform: "translate(-50%, -50%)",
                background: "hsl(227 100% 68% / 0.28)",
                filter: "blur(100px)",
                zIndex: 0,
              }}
            />
            <HeroCards properties={properties} />
            <HeroBadges />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
