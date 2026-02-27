"use client";

import { Search, Fingerprint, Shield, FileText } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Buscá tu propiedad",
    description: "Explorá opciones verificadas con filtros avanzados y fotos reales.",
  },
  {
    icon: Fingerprint,
    number: "02",
    title: "Verificá tu identidad",
    description: "Validación automática de identidad y solvencia en menos de 2 minutos.",
  },
  {
    icon: Shield,
    number: "03",
    title: "Elegí tu garantía",
    description: "Garantía digital mob. Sin garante, sin trámites presenciales.",
  },
  {
    icon: FileText,
    number: "04",
    title: "Firmá digitalmente",
    description: "Contrato con validez legal, firmado desde cualquier dispositivo.",
  },
];

const Timeline = () => {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
            Proceso simple
          </span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Cómo funciona
          </h2>
        </div>

        {/* Desktop: Horizontal timeline */}
        <div ref={ref} className="hidden md:grid grid-cols-4 gap-6 lg:gap-10 relative">
          {/* Dotted connecting line */}
          <div
            className="absolute top-10 left-[14%] right-[14%] border-t-2 border-dashed border-border/70 transition-all duration-700"
            style={{
              opacity: inView ? 1 : 0,
              clipPath: inView ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            }}
          />

          {steps.map((step, i) => (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center text-center transition-all duration-500 ease-out"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              {/* Icon container */}
              <div className="w-20 h-20 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center mb-6">
                <step.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
              </div>

              {/* Step number */}
              <span className="text-3xl font-bold text-primary/20 mb-2 font-display">
                {step.number}
              </span>

              {/* Title */}
              <h3 className="font-display font-bold text-foreground text-sm lg:text-base mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed max-w-[220px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden relative pl-14">
          {/* Vertical dotted line */}
          <div className="absolute left-[18px] top-2 bottom-2 border-l-2 border-dashed border-border/70" />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Icon */}
                <div className="absolute -left-14 top-0 w-10 h-10 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center z-10">
                  <step.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>

                {/* Step number */}
                <span className="text-xs font-bold text-primary/40 block mb-1 font-display">
                  {step.number}
                </span>

                {/* Title */}
                <h3 className="font-display font-bold text-foreground text-base mb-1">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
