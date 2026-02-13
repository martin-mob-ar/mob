import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Lock, ArrowRight, Check, ChevronLeft, ChevronRight, 
  Home, Users, CalendarCheck, FileText, Settings, 
  LayoutDashboard, Link2, Zap, AlertTriangle, Target,
  Clock, UserX, TrendingDown, Flame, BarChart3,
  Eye, ShieldCheck, UserCheck, Wallet, Scale,
  Building2, MessageSquare, Calendar, FileSignature
} from 'lucide-react';

const ACCESS_CODE = "1234";

// Shared card component for consistency
const SlideCard = ({ children, className = "", variant = "default" }: { 
  children: React.ReactNode; 
  className?: string;
  variant?: "default" | "primary" | "accent" | "warning";
}) => {
  const variants = {
    default: "bg-card border border-border/60",
    primary: "bg-accent border border-primary/20",
    accent: "bg-secondary border border-border/40",
    warning: "bg-destructive/5 border border-destructive/20"
  };
  
  return (
    <div className={`rounded-2xl ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Slide 1 - Hero
const SlideHero = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-4 font-display">
      Digitalizá tus alquileres
    </h1>
    <h2 className="text-xl md:text-2xl lg:text-3xl text-primary font-medium mb-10">
      Delegá la operación. Conservá el control.
    </h2>
    <SlideCard className="px-8 md:px-12 py-6 max-w-2xl" variant="primary">
      <p className="text-base md:text-lg text-foreground/80">
        Infraestructura operativa para alquileres tradicionales.
      </p>
    </SlideCard>
  </div>
);

// Slide 2 - Core Problem
const SlideCoreProblem = () => {
  const problems = [
    { icon: MessageSquare, label: "Consultas sin filtrar" },
    { icon: Calendar, label: "Visitas improductivas" },
    { icon: Settings, label: "Procesos manuales" },
    { icon: UserX, label: "Interesados sin respaldo" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <SlideCard className="px-6 py-3 mb-8" variant="warning">
        <span className="text-sm font-medium text-destructive">El desafío actual</span>
      </SlideCard>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-3 font-display">
        El problema no es la demanda
      </h1>
      <h2 className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground mb-12 md:mb-16">
        Es la operación del alquiler
      </h2>
      <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-3xl w-full">
        {problems.map((item, i) => (
          <SlideCard key={i} className="p-5 md:p-6 flex items-center gap-4" variant="accent">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-sm md:text-base text-foreground font-medium text-left">{item.label}</span>
          </SlideCard>
        ))}
      </div>
    </div>
  );
};

// Slide 3 - Why It Hurts
const SlideWhyItHurts = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
    <SlideCard className="p-6 md:p-10 max-w-xl" variant="primary">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Target className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-4 font-display">
        Mucho trabajo operativo
      </h1>
      <div className="w-16 h-1 bg-border mx-auto mb-4 rounded-full" />
      <h2 className="text-xl md:text-2xl lg:text-3xl text-muted-foreground">
        Poco foco en cerrar
      </h2>
    </SlideCard>
  </div>
);

// Slide 4 - Traditional Model
const SlideTraditionalModel = () => {
  const steps = ["Publicar", "Filtrar", "Coordinar", "Verificar", "Contratar", "Administrar"];
  
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <SlideCard className="px-6 py-3 mb-8" variant="accent">
        <span className="text-sm font-medium text-muted-foreground">Flujo actual</span>
      </SlideCard>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-12 md:mb-16 font-display">
        Modelo tradicional de alquiler
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-12 md:mb-14 max-w-4xl">
        {steps.map((step, i, arr) => (
          <React.Fragment key={step}>
            <SlideCard className="px-4 md:px-6 py-3 md:py-4" variant="accent">
              <span className="text-sm md:text-base font-medium text-foreground">{step}</span>
            </SlideCard>
            {i < arr.length - 1 && (
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50 hidden sm:block" />
            )}
          </React.Fragment>
        ))}
      </div>
      <SlideCard className="px-8 py-4" variant="warning">
        <p className="text-base md:text-lg text-foreground font-medium">
          Todo pasa por el mismo equipo.
        </p>
      </SlideCard>
    </div>
  );
};

// Slide 5 - Consequences
const SlideConsequences = () => {
  const consequences = [
    { icon: AlertTriangle, label: "Saturación operativa" },
    { icon: Flame, label: "Errores humanos" },
    { icon: TrendingDown, label: "Pérdida de oportunidades" },
    { icon: Clock, label: "Equipos quemados" },
    { icon: BarChart3, label: "Crecimiento limitado" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <SlideCard className="px-6 py-3 mb-8" variant="warning">
        <span className="text-sm font-medium text-destructive">Impacto negativo</span>
      </SlideCard>
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-10 md:mb-14 font-display">
        Cuando todo pasa por el mismo equipo
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl w-full">
        {consequences.map((item, i) => (
          <SlideCard key={i} className="p-5 md:p-6 flex flex-col items-center gap-3" variant="default">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-destructive" strokeWidth={1.5} />
            </div>
            <span className="text-destructive/90 font-medium text-sm md:text-base text-center">{item.label}</span>
          </SlideCard>
        ))}
      </div>
    </div>
  );
};

// Slide 6 - The Shift
const SlideTheShift = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
    <SlideCard className="p-6 md:p-10 max-w-xl" variant="primary">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Scale className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-4 font-display">
        Separar operación de decisión
      </h1>
      <div className="w-16 h-1 bg-primary/30 mx-auto mb-4 rounded-full" />
      <p className="text-lg md:text-xl text-muted-foreground">
        Ejecutar no es lo mismo que decidir.
      </p>
    </SlideCard>
  </div>
);

// Slide 7 - MOB Model
const SlideMOBModel = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
    <SlideCard className="px-6 py-3 mb-8" variant="primary">
      <span className="text-sm font-medium text-primary">La solución</span>
    </SlideCard>
    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-10 md:mb-14 font-display">
      <span className="text-primary">mob</span> es infraestructura operativa
    </h1>
    <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl w-full mb-10 md:mb-12">
      <SlideCard className="p-6 md:p-8 text-left" variant="primary">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-primary">mob ejecuta</h3>
        </div>
        <div className="space-y-3">
          {["Publicación", "Interesados", "Verificación", "Contratos", "Administración"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-foreground text-sm md:text-base">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </SlideCard>
      <SlideCard className="p-6 md:p-8 text-left" variant="accent">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <Building2 className="w-5 h-5 text-background" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">La inmobiliaria</h3>
        </div>
        <div className="space-y-3">
          {["Supervisa", "Decide", "Cierra"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-foreground text-sm md:text-base">
              <div className="w-2 h-2 bg-foreground rounded-full" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </SlideCard>
    </div>
    <SlideCard className="px-8 py-4" variant="default">
      <p className="text-base md:text-lg text-foreground">
        <span className="text-primary font-semibold">mob</span> hace. Tu inmobiliaria decide.
      </p>
    </SlideCard>
  </div>
);

// Slide 8 - Verification
const SlideVerification = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
    <SlideCard className="px-6 py-3 mb-8" variant="primary">
      <span className="text-sm font-medium text-primary">Seguridad desde el inicio</span>
    </SlideCard>
    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-10 md:mb-14 font-display">
      Todo verificado desde el inicio
    </h1>
    <div className="grid grid-cols-2 gap-4 md:gap-5 max-w-2xl w-full mb-10 md:mb-12">
      {[
        { icon: UserCheck, label: "Identidad" },
        { icon: ShieldCheck, label: "Antecedentes" },
        { icon: Wallet, label: "Situación financiera" },
        { icon: BarChart3, label: "Capacidad de pago" }
      ].map((item, i) => (
        <SlideCard key={i} className="p-5 md:p-6 flex items-center gap-4" variant="primary">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-foreground text-sm md:text-base font-medium text-left">{item.label}</span>
        </SlideCard>
      ))}
    </div>
    <SlideCard className="px-8 py-4" variant="accent">
      <p className="text-base md:text-lg text-foreground font-medium">
        Filtrar antes es más barato que corregir después.
      </p>
    </SlideCard>
  </div>
);

// NEW Slide 9 - Hoggax Verification Detail
const SlideHoggax = () => {
  const verifications = [
    { icon: UserCheck, label: "Identidad" },
    { icon: ShieldCheck, label: "Antecedentes" },
    { icon: Wallet, label: "Situación financiera" },
    { icon: BarChart3, label: "Capacidad de pago" }
  ];

  const benefits = [
    { icon: Calendar, label: "Menos visitas improductivas" },
    { icon: ShieldCheck, label: "Menos riesgo de morosidad" },
    { icon: Zap, label: "Decisiones más rápidas" },
    { icon: Users, label: "Mejor experiencia para propietarios" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-6">
      <SlideCard className="px-6 py-3 mb-6 md:mb-8" variant="primary">
        <span className="text-sm font-medium text-primary">Powered by Hoggax</span>
      </SlideCard>
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-8 md:mb-12 font-display text-center">
        Verificación de inquilinos por Hoggax
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl w-full mb-8 md:mb-10">
        {/* Left - What Hoggax verifies */}
        <SlideCard className="p-6 md:p-8" variant="primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Qué verifica Hoggax</h3>
          </div>
          <div className="space-y-4">
            {verifications.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-background/60">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-foreground text-sm md:text-base font-medium">{item.label}</span>
                <Check className="w-5 h-5 text-primary ml-auto" strokeWidth={2} />
              </div>
            ))}
          </div>
        </SlideCard>

        {/* Right - Benefits grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {benefits.map((item, i) => (
            <SlideCard key={i} className="p-4 md:p-5 flex flex-col items-center justify-center text-center" variant="accent">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-foreground text-xs md:text-sm font-medium leading-tight">{item.label}</span>
            </SlideCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// Slide 10 - MOB para Inmobiliarias
const SlideMOBInmobiliarias = () => {
  const features = [
    { icon: Home, label: "Publicación y gestión de propiedades" },
    { icon: CalendarCheck, label: "Coordinación de visitas" },
    { icon: Users, label: "Inquilinos verificados con Hoggax" },
    { icon: FileText, label: "Contratos digitales" },
    { icon: Settings, label: "Gestión post-alquiler" },
    { icon: LayoutDashboard, label: "Panel de control online" },
    { icon: Link2, label: "Integración con Tokko Broker" },
    { icon: Zap, label: "Modelo por operación cerrada" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-6 text-center">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-3 font-display">
        <span className="text-primary">mob</span> para Inmobiliarias
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-10">
        Infraestructura operativa para digitalizar y escalar alquileres.
      </p>
      
      {/* Features grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl w-full mb-8 md:mb-10">
        {features.map((feature, i) => (
          <SlideCard 
            key={i} 
            className="p-4 md:p-5 flex flex-col items-center gap-3"
            variant="default"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent flex items-center justify-center">
              <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-foreground text-xs md:text-sm font-medium text-center leading-tight">{feature.label}</span>
          </SlideCard>
        ))}
      </div>

      {/* Pricing callout */}
      <SlideCard className="px-6 md:px-10 py-5 md:py-6 mb-8 md:mb-10" variant="primary">
        <p className="text-muted-foreground text-sm mb-2">Sin costos fijos. Pagás cuando cerrás.</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Costo de plataforma</span>
        </div>
        <p className="text-4xl md:text-5xl font-bold text-primary mt-2">20%</p>
        <p className="text-muted-foreground text-sm mt-1">del primer mes de contrato</p>
      </SlideCard>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 text-sm font-medium">
          Sumar mi inmobiliaria a mob
        </Button>
        <Button variant="outline" className="border-primary/30 text-primary hover:bg-accent h-11 px-6 text-sm font-medium">
          Hablar con un asesor
        </Button>
      </div>
    </div>
  );
};

// Slide 11 - Control
const SlideControl = () => {
  const items = [
    { icon: Home, label: "Estado de cada propiedad" },
    { icon: UserCheck, label: "Interesados verificados" },
    { icon: Calendar, label: "Visitas realizadas" },
    { icon: FileSignature, label: "Contratos en curso" },
    { icon: Settings, label: "Post-alquiler" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <SlideCard className="px-6 py-3 mb-8" variant="primary">
        <span className="text-sm font-medium text-primary">Visibilidad total</span>
      </SlideCard>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-10 md:mb-14 font-display">
        Supervisión en tiempo real
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 max-w-4xl w-full mb-10 md:mb-12">
        {items.map((item, i) => (
          <SlideCard key={i} className="p-4 md:p-5 flex md:flex-col items-center gap-3 md:gap-4" variant="primary">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-foreground text-sm font-medium md:text-center">{item.label}</span>
          </SlideCard>
        ))}
      </div>
      <SlideCard className="px-8 py-4" variant="accent">
        <p className="text-base md:text-lg text-foreground">
          No perdés control. <span className="font-semibold text-primary">Ganás visibilidad.</span>
        </p>
      </SlideCard>
    </div>
  );
};

// Slide 12 - Impact
const SlideImpact = () => {
  const metrics = [
    { value: "70%", label: "menos carga operativa" },
    { value: "2×", label: "más cierres" },
    { value: "+4.000", label: "inquilinos verificados / mes" },
    { value: "+1.200", label: "contratos firmados" },
    { value: "+8.000", label: "visitas gestionadas" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <SlideCard className="px-6 py-3 mb-8" variant="primary">
        <span className="text-sm font-medium text-primary">Resultados reales</span>
      </SlideCard>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-10 md:mb-14 font-display">
        Impacto real del modelo
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5 max-w-5xl w-full">
        {metrics.map((metric, i) => (
          <SlideCard key={i} className="p-5 md:p-6" variant="default">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{metric.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground">{metric.label}</div>
          </SlideCard>
        ))}
      </div>
    </div>
  );
};

// Slide 9 - MOB para Inmobiliarias
const SlideCommercial = () => {
  const features = [
    { icon: Home, label: "Publicación y gestión de propiedades" },
    { icon: CalendarCheck, label: "Coordinación de visitas" },
    { icon: Users, label: "Inquilinos verificados con Hoggax" },
    { icon: FileText, label: "Contratos digitales" },
    { icon: Settings, label: "Gestión post-alquiler" },
    { icon: LayoutDashboard, label: "Panel de control online" },
    { icon: Link2, label: "Integración con Tokko Broker" },
    { icon: Check, label: "Modelo por operación cerrada" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-6 text-center">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-3 font-display">
        <span className="text-primary">mob</span> para Inmobiliarias
      </h1>
      <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10">
        Infraestructura operativa para digitalizar y escalar alquileres.
      </p>
      
      {/* Features grid - 2 rows x 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl w-full mb-8 md:mb-10">
        {features.map((feature, i) => (
          <SlideCard 
            key={i} 
            className="p-4 md:p-6 flex flex-col items-center gap-3"
            variant="default"
          >
            <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" strokeWidth={1.5} />
            <span className="text-foreground text-xs md:text-sm font-medium text-center leading-tight">{feature.label}</span>
          </SlideCard>
        ))}
      </div>

      {/* Pricing callout container */}
      <SlideCard className="px-6 md:px-12 py-6 md:py-8 max-w-2xl w-full" variant="default">
        <p className="text-base md:text-lg font-semibold text-foreground mb-4">
          Sin costos fijos. Pagás cuando cerrás.
        </p>
        <div className="bg-primary rounded-xl px-6 py-5 md:px-8 md:py-6 inline-block">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/80 font-medium mb-2">
            Costo de plataforma
          </p>
          <p className="text-4xl md:text-5xl font-bold text-primary-foreground">
            20%
          </p>
          <p className="text-primary-foreground/80 text-sm mt-2">
            del primer mes de contrato
          </p>
        </div>
      </SlideCard>
    </div>
  );
};

// Slide 14 - Closing
const SlideClosing = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
    <SlideCard className="p-10 md:p-16 max-w-3xl mb-8" variant="primary">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-2 font-display">
        Delegá la operación.
      </h1>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-8 font-display">
        Conservá el control.
      </h1>
      <div className="w-24 h-1 bg-primary/30 mx-auto mb-8 rounded-full" />
      <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
        <span className="text-primary font-semibold">mob</span> ejecuta el proceso del alquiler.<br />
        Tu inmobiliaria decide y cierra.
      </p>
    </SlideCard>
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base min-w-[200px] shadow-lg shadow-primary/20">
        Sumar mi inmobiliaria a mob
      </Button>
      <Button variant="outline" className="border-primary/30 text-primary hover:bg-accent h-12 px-8 text-base min-w-[200px]">
        Hablar con un asesor
      </Button>
    </div>
  </div>
);

const SLIDES: React.FC[] = [
  SlideHero,
  SlideCoreProblem,
  SlideWhyItHurts,
  SlideTraditionalModel,
  SlideConsequences,
  SlideTheShift,
  SlideMOBModel,
  SlideHoggax,
  SlideControl,
  SlideImpact,
  SlideCommercial,
  SlideClosing,
];

const PresentacionComercial2 = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const goToSlide = useCallback((index: number, dir: 'next' | 'prev') => {
    if (isAnimating || index < 0 || index >= SLIDES.length) return;
    setIsAnimating(true);
    setDirection(dir);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1, 'next');
    }
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1, 'prev');
    }
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAuthenticated) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, nextSlide, prevSlide]);

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Only trigger if horizontal swipe is dominant and significant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <SlideCard className="w-full max-w-sm p-8" variant="default">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2 font-display">Presentación comercial</h1>
            <p className="text-sm text-muted-foreground">Ingresá el código de acceso</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Código de acceso"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`h-12 text-center text-lg tracking-widest ${error ? 'border-destructive focus:border-destructive' : 'border-border'}`}
            />
            {error && (
              <p className="text-sm text-destructive text-center">Código incorrecto</p>
            )}
            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              Acceder
            </Button>
          </form>
        </SlideCard>
      </div>
    );
  }

  const CurrentSlideComponent = SLIDES[currentSlide];

  return (
    <div 
      className="h-screen w-screen bg-background overflow-hidden relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with logo */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <span className="text-lg font-bold text-primary font-display">mob</span>
        <SlideCard className="px-3 py-1.5" variant="accent">
          <span className="text-sm text-muted-foreground font-medium">
            {currentSlide + 1} / {SLIDES.length}
          </span>
        </SlideCard>
      </header>

      {/* Slide container */}
      <div className="h-full w-full">
        <div 
          key={currentSlide}
          className={`h-full w-full transition-all duration-300 ease-out ${
            isAnimating 
              ? direction === 'next' 
                ? 'opacity-0 translate-y-4' 
                : 'opacity-0 -translate-y-4'
              : 'opacity-100 translate-y-0'
          }`}
        >
          <CurrentSlideComponent />
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-accent">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
        />
      </div>

      {/* Navigation arrows - desktop only */}
      <div className="fixed bottom-6 right-6 hidden md:flex items-center gap-2 z-50">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
            currentSlide === 0 
              ? 'border-border text-muted-foreground/30 cursor-not-allowed' 
              : 'border-border text-muted-foreground hover:bg-accent hover:text-primary'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={nextSlide}
          disabled={currentSlide === SLIDES.length - 1}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
            currentSlide === SLIDES.length - 1 
              ? 'border-border text-muted-foreground/30 cursor-not-allowed' 
              : 'border-border text-muted-foreground hover:bg-accent hover:text-primary'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile swipe hint - only on first slide */}
      {currentSlide === 0 && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center md:hidden">
          <SlideCard className="flex items-center gap-2 px-4 py-2" variant="accent">
            <span className="text-muted-foreground text-sm">Deslizá para continuar</span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </SlideCard>
        </div>
      )}

      {/* Dot indicators */}
      <div className="fixed bottom-6 left-6 hidden md:flex items-center gap-1.5 z-50">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index, index > currentSlide ? 'next' : 'prev')}
            className={`h-2 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-primary w-6' 
                : 'bg-border hover:bg-muted-foreground w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PresentacionComercial2;
