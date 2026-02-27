"use client";

import { Search, Shield, FileText, Users, Zap, Building2, CheckCircle } from "lucide-react";
import { useInView } from "@/hooks/useInView";

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
    <section className="py-16 md:py-20">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
            Plataforma integral
          </span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Todo lo que necesitás, en un solo lugar
          </h2>
        </div>

        {/* Desktop Bento Grid */}
        <div ref={ref} className="hidden md:grid grid-cols-3 gap-4 auto-rows-[180px]">
          {/* Card 1 - Encontrá tu hogar (large, spans 2 rows) */}
          <div
            className="row-span-2 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/15 rounded-2xl p-6 flex flex-col justify-between"
            style={cardStyle(0)}
          >
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                <Users className="h-3 w-3" />
                Para inquilinos
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                Encontrá tu hogar<br />sin vueltas
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  Verificación en menos de 2 minutos
                </li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  Sin aval tradicional
                </li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  Contratos 100% digitales
                </li>
              </ul>
            </div>
            {/* Mini search preview */}
            <div className="mt-4 bg-background/80 backdrop-blur-sm rounded-xl border border-border p-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span>2 amb. en Palermo</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px]">
                <span className="font-semibold text-foreground">$850.000/mes</span>
                <span className="text-primary font-medium">Ver →</span>
              </div>
            </div>
          </div>

          {/* Card 2 - Stats: +4.000 */}
          <div
            className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-center items-center text-center"
            style={cardStyle(80)}
          >
            <span className="font-display font-extrabold text-4xl text-primary">+4.000</span>
            <p className="text-sm text-muted-foreground mt-2">Inquilinos verificados cada mes</p>
          </div>

          {/* Card 3 - Verificación en 2 minutos */}
          <div
            className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-center items-center text-center"
            style={cardStyle(160)}
          >
            <Shield className="h-8 w-8 text-emerald-500 mb-2" />
            <h3 className="font-display font-bold text-lg text-foreground">
              Verificación en <span className="text-primary">2 minutos</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">Identidad y solvencia al instante</p>
          </div>

          {/* Card 4 - Sin aval tradicional */}
          <div
            className="col-span-2 bg-primary rounded-2xl p-6 flex items-center gap-6 text-primary-foreground"
            style={cardStyle(240)}
          >
            <div className="shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold mb-2">
                Garantía mob
              </span>
              <h3 className="font-display font-bold text-lg">Sin aval tradicional</h3>
              <p className="text-sm text-primary-foreground/80 mt-0.5">
                Olvidate del garante. Nuestra garantía digital te cubre.
              </p>
            </div>
          </div>

          {/* Card 5 - 100% Digital */}
          <div
            className="bg-foreground text-background rounded-2xl p-6 flex flex-col justify-center"
            style={cardStyle(320)}
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold mb-3 self-start">
              <Zap className="h-3 w-3" />
              Experiencia completa
            </span>
            <h3 className="font-display font-bold text-2xl">100%<br />Digital</h3>
            <p className="text-sm text-background/60 mt-2">
              Desde la búsqueda hasta la firma del contrato, todo sin salir de la plataforma.
            </p>
          </div>

          {/* Card 6 - Inmobiliarias verificadas */}
          <div
            className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5"
            style={cardStyle(400)}
          >
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">Inmobiliarias verificadas</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Solo trabajamos con inmobiliarias que cumplen nuestros estándares.
              </p>
            </div>
          </div>

          {/* Card 7 - Firma digital */}
          <div
            className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5"
            style={cardStyle(480)}
          >
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">Firma digital</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Contrato con validez legal, firmado desde cualquier dispositivo.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Single column stack */}
        <div className="md:hidden space-y-3">
          {/* Encontrá tu hogar */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/15 rounded-2xl p-5">
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
                Verificación en menos de 2 minutos
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                Sin aval tradicional
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                Contratos 100% digitales
              </li>
            </ul>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="font-display font-extrabold text-2xl text-primary">+4.000</span>
              <p className="text-xs text-muted-foreground mt-1">Verificados/mes</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <Shield className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
              <span className="font-display font-bold text-base text-foreground">2 min</span>
              <p className="text-xs text-muted-foreground mt-0.5">Verificación</p>
            </div>
          </div>

          {/* Sin aval */}
          <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
            <span className="inline-flex px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold mb-2">
              Garantía mob
            </span>
            <h3 className="font-display font-bold text-lg">Sin aval tradicional</h3>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Olvidate del garante. Nuestra garantía digital te cubre.
            </p>
          </div>

          {/* 100% Digital */}
          <div className="bg-foreground text-background rounded-2xl p-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold mb-2">
              <Zap className="h-3 w-3" />
              Experiencia completa
            </span>
            <h3 className="font-display font-bold text-xl">100% Digital</h3>
            <p className="text-sm text-background/60 mt-1">
              Desde la búsqueda hasta la firma, todo en la plataforma.
            </p>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4">
              <Building2 className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-display font-bold text-sm text-foreground">Inmobiliarias verificadas</h3>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <FileText className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-display font-bold text-sm text-foreground">Firma digital</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
