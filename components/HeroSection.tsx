"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, CalendarCheck, ShieldCheck, Globe } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import HeroCards from "@/components/HeroCards";
import HeroBadges from "@/components/HeroBadges";
import { Property } from "@/components/PropertyCard";
import { getPropertyUrl } from "@/lib/utils/property-url";

interface HeroSectionProps {
  properties: Property[];
}

/** Hardcoded mobile hero card — purely decorative, not clickable. */
const MobileHeroCard = () => {
  return (
    <div className="block relative z-10">
      {/* Float wrapper — same pattern as desktop HeroCards */}
      <div
        className="animate-badge-float"
        style={{ animationDuration: "3.6s", animationDelay: "0.4s" }}
      >
        <div
          className="bg-card rounded-xl border border-border/50 shadow-lg overflow-hidden"
          style={{ transform: "rotate(-3deg) scale(0.98)" }}
        >
          <div className="relative aspect-[4/3]">
            <Image
              src="/assets/property-7.jpg"
              alt="Av del Libertador 2400"
              fill
              className="object-cover"
              sizes="240px"
              priority
            />
          </div>
          <div className="p-3 text-left">
            <p className="text-sm font-bold text-foreground">
              $800.000
              <span className="text-[10px] font-normal text-muted-foreground ml-1">/mes</span>
            </p>
            <p className="text-xs font-medium text-foreground truncate mt-1">Av del Libertador 2400</p>
            <p className="text-[11px] text-muted-foreground truncate">Palermo</p>
            <p className="text-[10px] text-muted-foreground mt-1">2 dorm · 1 baño · 52m²</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = ({ properties }: HeroSectionProps) => {
  return (
    <section className="pt-8 pb-6 md:pt-16 md:pb-14 overflow-visible">
      <div className="container px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-5 md:gap-12">
          {/* Left Side - Text + SearchBar */}
          <div className="flex-1 w-full md:max-w-[55%] space-y-4 md:space-y-6 text-center md:text-left">
            <div>
              <h1 className="font-display text-[1.75rem] md:text-5xl font-bold leading-[1.1]">
                <span className="text-foreground">Alquilar ahora</span>
                <br />
                <span className="text-primary">es simple.</span>
              </h1>
              <p className="hidden md:block text-muted-foreground text-sm md:text-lg mt-3 md:mt-5 max-w-md mx-auto md:mx-0 leading-relaxed">
                Alquilá tu próximo hogar de manera digital, con visitas, reservas y garantía a mitad de precio.
              </p>
            </div>

            {/* ── Mobile: Card showcase with floating badges ── */}
              <div className="md:hidden relative py-4 flex justify-center">
                {/* Ambient glow — matches desktop aesthetic */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: "320px",
                    height: "280px",
                    transform: "translate(-50%, -50%)",
                    background: "hsl(227 100% 68% / 0.20)",
                    filter: "blur(80px)",
                    zIndex: 0,
                  }}
                />

                {/* Card + badges container */}
                <div className="relative w-[240px]">
                  <MobileHeroCard />

                  {/* Floating badge: top-right — Garantía 50% off */}
                  <div
                    className="absolute z-20 opacity-0 animate-fade-in"
                    style={{
                      top: "-10px",
                      right: "-36px",
                      animationDelay: "500ms",
                      animationFillMode: "forwards",
                    }}
                  >
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border/60 shadow-md text-xs font-medium text-foreground whitespace-nowrap animate-badge-float"
                      style={{ animationDuration: "3.2s" }}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" strokeWidth={1.8} />
                      Garantía 50% off
                    </div>
                  </div>

                  {/* Floating badge: middle-left — Agenda tu visita */}
                  <div
                    className="absolute z-20 opacity-0 animate-fade-in"
                    style={{
                      top: "20%",
                      left: "-52px",
                      animationDelay: "700ms",
                      animationFillMode: "forwards",
                    }}
                  >
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border/60 shadow-md text-xs font-medium text-foreground whitespace-nowrap animate-badge-float"
                      style={{ animationDuration: "3.4s", animationDelay: "0.8s" }}
                    >
                      <CalendarCheck className="h-3.5 w-3.5 text-primary" strokeWidth={1.8} />
                      Agenda tu visita
                    </div>
                  </div>

                  {/* Floating badge: bottom-right — Reserva online */}
                  <div
                    className="absolute z-20 opacity-0 animate-fade-in"
                    style={{
                      bottom: "8px",
                      right: "-40px",
                      animationDelay: "900ms",
                      animationFillMode: "forwards",
                    }}
                  >
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border/60 shadow-md text-xs font-medium text-foreground whitespace-nowrap animate-badge-float"
                      style={{ animationDuration: "3s", animationDelay: "0.2s" }}
                    >
                      <Globe className="h-3.5 w-3.5 text-primary" strokeWidth={1.8} />
                      Reserva online
                    </div>
                  </div>
                </div>
              </div>

            {/* Search bar */}
            <div className="flex justify-center md:justify-start w-full">
              <SearchBar />
            </div>

          </div>

          {/* ── Right Side - Card + Badges (desktop only) ── */}
          <div className="hidden md:block flex-1 relative min-h-[500px] max-w-[45%]">
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
