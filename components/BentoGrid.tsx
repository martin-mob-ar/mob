"use client";

import { Search, Fingerprint, Shield, Users, Zap, Building2, CheckCircle, Smartphone } from "lucide-react";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { GarantiaTooltip } from "@/components/GarantiaTooltip";

const BentoGrid = () => {
  const { ref, inView } = useInView({ threshold: 0.1 });

  const cardStyle = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
    transitionProperty: "opacity, transform",
    transitionDuration: "500ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDelay: `${delay}ms`,
  });

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
            Plataforma integral
          </span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Todo lo que necesitás para alquilar, en un solo lugar
          </h2>
        </div>

        {/* Desktop Bento Grid */}
        <div ref={ref} className="hidden md:grid grid-cols-3 gap-4 auto-rows-[180px]">
          {/* Card 1 - Encontrá tu hogar (large, spans 2 rows) */}
          <div
            className="group row-span-2 relative bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-primary/[0.10] border border-primary/15 rounded-xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_-8px_hsl(227_100%_66%/0.15)] cursor-pointer"
            style={cardStyle(0)}
          >
            {/* Stretched link covers the whole card */}
            <Link href="/buscar" className="absolute inset-0 z-0 rounded-xl" aria-label="Buscar propiedades" />
            {/* Subtle corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/[0.08] to-transparent rounded-tr-xl rounded-bl-[80px] pointer-events-none" />
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 transition-colors duration-300 group-hover:bg-primary/15">
                <Users className="h-3 w-3" />
                Para inquilinos
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                Encontrá tu hogar<br />sin vueltas
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  Verificate en menos de 2 minutos
                </li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <GarantiaTooltip>Accedé a garantía 50% off</GarantiaTooltip>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  Agendá visitas y reservá online
                </li>
              </ul>
            </div>
            {/* Mini search preview - own link with higher z-index */}
            <Link href="/buscar?minAmbientes=2&location=Capital%20Federal&locationId=51400" className="relative z-10 mt-4 bg-background/80 backdrop-blur-sm rounded-xl border border-border p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 block">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  <span>2 ambientes en CABA</span>
                </div>
                <span className="text-[11px] text-primary font-medium group-hover:underline">
                  Ver →
                </span>
              </div>
            </Link>
          </div>

          {/* Card 2 - Verificación en 2 minutos */}
          <div
            className="group relative bg-gradient-to-br from-card via-card to-emerald-50/50 dark:to-emerald-950/20 border border-border rounded-xl p-6 flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-[0_8px_30px_-8px_hsl(142_71%_45%/0.12)]"
            style={cardStyle(80)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
              <Fingerprint className="h-7 w-7 text-emerald-500" />
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
            </div>
            <h3 className="relative font-display font-bold text-lg text-foreground">
              Verificación en <span className="text-primary">2 minutos</span>
            </h3>
            <p className="relative text-xs text-muted-foreground mt-1.5">Te aprobamos como inquilino calificado para que alquiles más rápido</p>
          </div>

          {/* Card 3 - Alquilá con tu celular */}
          <div
            className="group relative bg-gradient-to-br from-card via-card to-primary/[0.04] border border-border rounded-xl p-6 flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_30px_-8px_hsl(227_100%_66%/0.10)]"
            style={cardStyle(160)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
              <Smartphone className="h-7 w-7 text-primary" />
              <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
            </div>
            <h3 className="relative font-display font-bold text-lg text-foreground">
              Alquilá solo usando tu celular
            </h3>
          </div>

          {/* Card 4 - Garantía digital */}
          <div
            className="group col-span-2 bento-shimmer bg-gradient-to-r from-primary via-primary to-[hsl(240_100%_72%)] rounded-xl p-6 flex items-center gap-6 text-primary-foreground transition-all duration-300 hover:shadow-[0_8px_30px_-4px_hsl(227_100%_66%/0.40)] hover:scale-[1.01]"
            style={cardStyle(240)}
          >
            <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/25">
              <Shield className="h-7 w-7" />
              <div className="absolute inset-0 rounded-2xl bg-white/10 blur-lg" />
            </div>
            <div className="relative">
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold mb-2 backdrop-blur-sm">
                Garantía mob
              </span>
              <h3 className="font-display font-bold text-lg">Garantía digital</h3>
              <p className="text-sm text-primary-foreground/90 mt-0.5">
                <GarantiaTooltip>Accedé a 50% off en una garantía digital con aprobación instantánea</GarantiaTooltip>
              </p>
            </div>
          </div>

          {/* Card 5 - 100% Online */}
          <div
            className="group relative bg-foreground text-background rounded-xl p-6 flex flex-col justify-center overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-4px_hsl(222_47%_11%/0.30)] hover:scale-[1.01]"
            style={cardStyle(320)}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-xl" />
            <span className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold mb-3 self-start backdrop-blur-sm">
              <Zap className="h-3 w-3" />
              Experiencia completa
            </span>
            <h3 className="relative font-display font-bold text-2xl">100%<br />Online</h3>
            <p className="relative text-sm text-background/75 mt-2">
              Desde la búsqueda hasta la firma del contrato, todo sin salir de la plataforma.
            </p>
          </div>

          {/* Card 6 - Inmobiliarias verificadas */}
          <Link
            href="/inmobiliarias"
            className="group relative bg-gradient-to-br from-card to-primary/[0.03] border border-border rounded-xl p-6 flex items-center gap-5 overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_30px_-8px_hsl(227_100%_66%/0.10)] cursor-pointer"
            style={cardStyle(400)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
              <Building2 className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 rounded-xl bg-primary/10 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-50" />
            </div>
            <div className="relative">
              <h3 className="font-display font-bold text-base text-foreground">Inmobiliarias verificadas</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Solo trabajamos con inmobiliarias que cumplen nuestros estándares.
              </p>
            </div>
          </Link>

          {/* Card 7 - Inquilinos verificados */}
          <div
            className="group relative bg-gradient-to-br from-card to-primary/[0.03] border border-border rounded-xl p-6 flex items-center gap-5 overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_30px_-8px_hsl(227_100%_66%/0.10)]"
            style={cardStyle(480)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
              <Shield className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 rounded-xl bg-primary/10 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-50" />
            </div>
            <div className="relative">
              <h3 className="font-display font-bold text-base text-foreground">Inquilinos verificados</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Verificamos cada propietario junto con sus antecedentes y situación financiera
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Single column stack */}
        <div className="md:hidden space-y-3">
          {/* Encontrá tu hogar */}
          <div className="relative bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-primary/[0.10] border border-primary/15 rounded-xl p-5 overflow-hidden">
            <Link href="/buscar" className="absolute inset-0 z-0 rounded-xl" aria-label="Buscar propiedades" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/[0.08] to-transparent rounded-tr-xl rounded-bl-[60px] pointer-events-none" />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Users className="h-3 w-3" />
              Para inquilinos
            </span>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              Encontrá tu hogar sin vueltas
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                Verificate en menos de 2 minutos
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <GarantiaTooltip>Accedé a garantía 50% off</GarantiaTooltip>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                Agendá visitas y reservá online
              </li>
            </ul>
            {/* Mini search preview - own link */}
            <Link href="/buscar?minAmbientes=2&location=Capital%20Federal&locationId=51400" className="relative z-10 mt-4 bg-background/80 backdrop-blur-sm rounded-xl border border-border p-3 shadow-sm block">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  <span>2 ambientes en CABA</span>
                </div>
                <span className="text-[11px] text-primary font-medium">
                  Ver →
                </span>
              </div>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative bg-gradient-to-br from-card to-emerald-50/50 dark:to-emerald-950/20 border border-border rounded-xl p-4 text-center overflow-hidden">
              <div className="relative w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-1.5">
                <Fingerprint className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="font-display font-bold text-base text-foreground">2 min</span>
              <p className="text-xs text-muted-foreground mt-0.5">Verificación</p>
            </div>
            <div className="relative bg-gradient-to-br from-card to-primary/[0.04] border border-border rounded-xl p-4 text-center flex flex-col items-center justify-center overflow-hidden">
              <div className="relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display font-bold text-sm text-foreground">Desde tu celular</span>
            </div>
          </div>

          {/* Garantía digital */}
          <div className="bento-shimmer bg-gradient-to-r from-primary via-primary to-[hsl(240_100%_72%)] rounded-xl p-5 text-primary-foreground">
            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold mb-2 backdrop-blur-sm">
              Garantía mob
            </span>
            <h3 className="font-display font-bold text-lg">Garantía digital</h3>
            <p className="text-sm text-primary-foreground/90 mt-1">
              <GarantiaTooltip>Accedé a 50% off en una garantía digital con aprobación instantánea</GarantiaTooltip>
            </p>
          </div>

          {/* 100% Online */}
          <div className="relative bg-foreground text-background rounded-xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-xl" />
            <span className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold mb-2 backdrop-blur-sm">
              <Zap className="h-3 w-3" />
              Experiencia completa
            </span>
            <h3 className="relative font-display font-bold text-xl">100% Online</h3>
            <p className="relative text-sm text-background/75 mt-1">
              Desde la búsqueda hasta la firma, todo en la plataforma.
            </p>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/inmobiliarias" className="relative bg-gradient-to-br from-card to-primary/[0.03] border border-border rounded-xl p-4 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-sm text-foreground">Inmobiliarias verificadas</h3>
            </Link>
            <div className="relative bg-gradient-to-br from-card to-primary/[0.03] border border-border rounded-xl p-4 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-sm text-foreground">Inquilinos verificados</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
