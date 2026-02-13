"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Users, ShieldCheck, Smartphone, Award, CreditCard, TrendingUp, ArrowRight, FileCheck, Building, Check, ChevronDown, Minus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
const MobBrand = () => <span className="font-ubuntu font-bold text-primary">mob</span>;

// Pricing table data
const pricingSections = [{
  title: "Publicación",
  rows: [{
    feature: "Promoción",
    basico: "Publicación básica",
    acompanado: "Publicación destacada",
    experiencia: "Destacada + redes"
  }, {
    feature: "Fotos",
    basico: "Propias",
    acompanado: "Propias",
    experiencia: "Profesionales"
  }, {
    feature: "Precio sugerido",
    basico: "—",
    acompanado: "—",
    experiencia: "Incluido"
  }, {
    feature: "Verificación",
    basico: "—",
    acompanado: "Propietario",
    experiencia: "Propietario + propiedad"
  }, {
    feature: "Aviso mejorado con IA",
    basico: "Incluido",
    acompanado: "Incluido",
    experiencia: "Incluido"
  }]
}, {
  title: "Gestión",
  rows: [{
    feature: "Interesados",
    basico: "Verificados",
    acompanado: "Verificados y pre-calificados",
    experiencia: "Verificados y pre-calificados"
  }, {
    feature: "Visitas",
    basico: "—",
    acompanado: "Gestión de disponibilidad",
    experiencia: "Coordinación y seguimiento"
  }]
}, {
  title: "Legal",
  rows: [{
    feature: "Contrato",
    basico: "Modelo",
    acompanado: "Confección",
    experiencia: "Confección"
  }, {
    feature: "Firma digital",
    basico: "—",
    acompanado: "Incluida",
    experiencia: "Incluida"
  }, {
    feature: "Garantía para tu inquilino",
    basico: "Asesoramiento",
    acompanado: "Asesoramiento + descuento 50%",
    experiencia: "Asesoramiento + descuento 50%"
  }]
}, {
  title: "Administración",
  rows: [{
    feature: "Post-alquiler",
    basico: "Sistema de reclamos",
    acompanado: "Sistema de reclamos",
    experiencia: "Administración completa (opcional)"
  }]
}];
const pricingCost = {
  basico: "Sin costo",
  acompanado: "Medio mes",
  experiencia: "Primer mes"
};
interface PricingTableProps {
  handleStartPublish: () => void;
  scrollToFormAndAnimate: () => void;
}

// Helper to render cell content with proper styling
const CellContent = ({
  value,
  isHighlighted = false
}: {
  value: string;
  isHighlighted?: boolean;
}) => {
  if (value === "—") {
    return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  }
  return <span className={cn("text-sm leading-relaxed", isHighlighted ? "text-foreground font-medium" : "text-muted-foreground")}>
      {value}
    </span>;
};

// Mobile Plan Card Component
const MobilePlanCard = ({
  plan,
  isRecommended,
  scrollToFormAndAnimate,
  openSections,
  toggleSection
}: {
  plan: 'basico' | 'acompanado' | 'experiencia';
  isRecommended?: boolean;
  scrollToFormAndAnimate: () => void;
  openSections: Record<string, boolean>;
  toggleSection: (title: string) => void;
}) => {
  const planNames = {
    basico: "Básico",
    acompanado: "Acompañado",
    experiencia: <>Experiencia <span className="font-ubuntu text-primary">mob</span></>
  };
  const planDescriptions = {
    basico: "Para empezar sin costo",
    acompanado: "Más visibilidad y soporte",
    experiencia: "Gestión completa, sin ocuparte de nada"
  };
  const planCtas = {
    basico: "Elegir básico",
    acompanado: "Elegir acompañado",
    experiencia: "Quiero gestión completa"
  };
  return <div className={cn("rounded-2xl p-6 transition-all", isRecommended ? "bg-primary/[0.03] border-2 border-primary shadow-lg shadow-primary/5" : "bg-card border border-border/60")}>
      {/* Header */}
      <div className="mb-6">
        {isRecommended && <span className="inline-block bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full mb-3 tracking-wide">
            RECOMENDADO
          </span>}
        <h3 className={cn("font-display font-bold mb-1", isRecommended ? "text-2xl" : "text-xl")}>
          {planNames[plan]}
        </h3>
        <p className="text-sm text-muted-foreground">{planDescriptions[plan]}</p>
      </div>

      {/* Cost */}
      <div className="mb-6 pb-6 border-b border-border/50">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Costo de plataforma</div>
        <div className="text-sm text-muted-foreground">
          {pricingCost[plan]}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-1 mb-6">
        {pricingSections.map((section, idx) => <Collapsible key={idx} open={openSections[`${plan}-${section.title}`]} onOpenChange={() => toggleSection(`${plan}-${section.title}`)}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-left group">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                {section.title}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", openSections[`${plan}-${section.title}`] && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pb-3">
                {section.rows.map((row, rowIdx) => {
              const value = row[plan];
              const isEmpty = value === "—";
              return <div key={rowIdx} className="flex items-start gap-3">
                      {isEmpty ? <Minus className="h-4 w-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" /> : <Check className={cn("h-4 w-4 mt-0.5 flex-shrink-0", isRecommended ? "text-primary" : "text-muted-foreground")} />}
                      <div>
                        <div className={cn("text-xs", isEmpty ? "text-muted-foreground/50" : "text-muted-foreground")}>
                          {row.feature}
                        </div>
                        {!isEmpty && <div className={cn("text-sm", isRecommended ? "text-foreground font-medium" : "text-foreground")}>
                            {value}
                          </div>}
                      </div>
                    </div>;
            })}
              </div>
            </CollapsibleContent>
          </Collapsible>)}
      </div>

      {/* CTA */}
      <Button variant={plan === "experiencia" ? "default" : "outline"} size="lg" className={cn("w-full rounded-full", plan === "experiencia" && "shadow-md shadow-primary/20")} onClick={scrollToFormAndAnimate}>
        {planCtas[plan]}
      </Button>
    </div>;
};
const PricingTable = ({
  handleStartPublish,
  scrollToFormAndAnimate
}: PricingTableProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ['basico', 'acompanado', 'experiencia'].forEach(plan => {
      pricingSections.forEach(section => {
        initial[`${plan}-${section.title}`] = true;
      });
    });
    return initial;
  });
  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  return <div className="max-w-5xl mx-auto">
      {/* Desktop: Compact comparative table */}
      <div className="hidden lg:block">
        {/* Table container with highlighted column */}
        <div className="relative bg-white rounded-xl border border-border/40 overflow-hidden">
          {/* Highlighted column background for Experiencia mob */}
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-primary/[0.04] border-l border-primary/20 pointer-events-none rounded-tr-xl" />
          
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-border/30 relative">
            <div className="px-3 py-2" />
            <div className="px-3 py-2 text-center">
              <span className="text-sm font-semibold text-foreground">Básico</span>
            </div>
            <div className="px-3 py-2 text-center">
              <span className="text-sm font-semibold text-foreground">Acompañado</span>
            </div>
            <div className="px-3 py-2 text-center">
              <span className="text-sm font-semibold text-foreground">
                Experiencia <span className="font-ubuntu text-primary">mob</span>
              </span>
            </div>
          </div>

          {/* Table body */}
          <div className="relative">
            {pricingSections.map((section, sectionIdx) => <div key={sectionIdx}>
                {/* Section header row */}
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-muted/40">
                  <div className="px-3 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </span>
                  </div>
                  <div />
                  <div />
                  <div />
                </div>
                
                {/* Feature rows */}
                {section.rows.map((row, rowIdx) => <div key={rowIdx} className={cn("grid grid-cols-[1fr_1fr_1fr_1fr]", rowIdx < section.rows.length - 1 && "border-b border-border/10")}>
                    <div className="px-3 py-1.5 flex items-center">
                      <span className="text-xs text-muted-foreground">{row.feature}</span>
                    </div>
                    <div className="px-3 py-1.5 flex items-center justify-center">
                      {row.basico === "—" ? <span className="text-muted-foreground/25 text-xs">—</span> : row.basico === "Incluido" ? <Check className="h-3.5 w-3.5 text-muted-foreground/60" /> : <span className="text-xs text-muted-foreground text-center">{row.basico}</span>}
                    </div>
                    <div className="px-3 py-1.5 flex items-center justify-center">
                      {row.acompanado === "—" ? <span className="text-muted-foreground/25 text-xs">—</span> : row.acompanado === "Incluido" || row.acompanado === "Incluida" ? <Check className="h-3.5 w-3.5 text-muted-foreground/60" /> : <span className="text-xs text-muted-foreground text-center">{row.acompanado}</span>}
                    </div>
                    <div className="px-3 py-1.5 flex items-center justify-center">
                      {row.experiencia === "—" ? <span className="text-muted-foreground/25 text-xs">—</span> : row.experiencia === "Incluido" || row.experiencia === "Incluida" ? <Check className="h-3.5 w-3.5 text-primary" /> : <span className="text-xs text-foreground font-semibold text-center">{row.experiencia}</span>}
                    </div>
                  </div>)}
              </div>)}

            {/* Cost row */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-t border-border/30 bg-muted/20">
              <div className="px-3 py-2 flex items-center">
                <span className="text-xs font-medium text-foreground">Costo de plataforma</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">{pricingCost.basico}</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">{pricingCost.acompanado}</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">{pricingCost.experiencia}</span>
              </div>
            </div>

          </div>
        </div>

        {/* CTA Section - Single centered button */}
        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            className="text-sm rounded-full h-11 px-8 shadow-lg shadow-primary/25 font-semibold" 
            onClick={scrollToFormAndAnimate}
          >
            Quiero publicar
          </Button>
        </div>
        
        {/* Payment clarification */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            El costo se cobra únicamente cuando el alquiler se concreta.
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            No hay costos iniciales.
          </p>
        </div>
      </div>

      {/* Mobile: Stacked cards with Experiencia mob first */}
      <div className="lg:hidden space-y-4">
        <MobilePlanCard plan="experiencia" isRecommended scrollToFormAndAnimate={scrollToFormAndAnimate} openSections={openSections} toggleSection={toggleSection} />
        <MobilePlanCard plan="acompanado" scrollToFormAndAnimate={scrollToFormAndAnimate} openSections={openSections} toggleSection={toggleSection} />
        <MobilePlanCard plan="basico" scrollToFormAndAnimate={scrollToFormAndAnimate} openSections={openSections} toggleSection={toggleSection} />
        
        {/* Mobile clarification - prominent */}
        <p className="text-center text-base font-medium text-foreground pt-6">El costo se cobra únicamente cuando el alquiler se concreta.

      </p>
      </div>
    </div>;
};
const LandingPropietarios = () => {
  const router = useRouter();
  const {
    isAuthenticated
  } = useAuth();
  const scrollToForm = () => {
    const formElement = document.getElementById('publish-form');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  
  const scrollToFormAndAnimate = () => {
    const formElement = document.getElementById('publish-form');
    if (formElement) {
      // Scroll to center the form on screen
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
    // Wait for scroll to complete, then animate the button
    setTimeout(() => {
      const submitBtn = document.getElementById('submit-publish-btn');
      if (submitBtn) {
        submitBtn.classList.add('animate-pulse-glow');
        setTimeout(() => {
          submitBtn.classList.remove('animate-pulse-glow');
        }, 2000);
      }
    }, 600);
  };
  const handleStartPublish = () => {
    if (isAuthenticated) {
      router.push("/subir-propiedad");
    } else {
      router.push("/auth?redirect=/subir-propiedad");
    }
  };
  const whyPublish = [{
    icon: ShieldCheck,
    title: "Inquilinos verificados",
    description: "Validamos identidad, antecedentes y perfil crediticio junto con Hoggax."
  }, {
    icon: Smartphone,
    title: "Proceso 100% digital",
    description: "Agenda de visitas online, contrato digital y gestión centralizada."
  }, {
    icon: CreditCard,
    title: "Cobro asegurado",
    description: "Cobrás todos los meses en tiempo y forma gracias al respaldo de Hoggax."
  }];
  const benefitsCards = [{
    icon: CreditCard,
    title: "Publicación sin costo inicial",
    description: "Publicá tu inmueble sin pagar nada al inicio. Abonás cuando el alquiler se concreta."
  }, {
    icon: TrendingUp,
    title: "Alquilá más rápido",
    description: "Si está en precio, en 1 semana ya está alquilado."
  }, {
    icon: Users,
    title: "Inquilinos verificados por Hoggax",
    description: "Evaluación de perfil crediticio, antecedentes y capacidad de pago."
  }, {
    icon: ShieldCheck,
    title: "Cobro garantizado",
    description: "Cobrás todos los meses en una fecha fija, con respaldo de Hoggax."
  }, {
    icon: Building,
    title: "Gestión 100% digital y centralizada",
    description: "Administrá publicaciones, visitas, propuestas, contratos y pagos desde un solo lugar."
  }, {
    icon: FileCheck,
    title: "Contrato digital con validez legal",
    description: "Firmá contratos online, acelerando los tiempos y simplificando el proceso."
  }];
  const howItWorks = [{
    step: "01",
    title: "Publicá tu propiedad",
    description: "Cargá fotos, descripción y precio en minutos."
  }, {
    step: "02",
    title: "Recibí interesados verificados",
    description: "Solo te contactan inquilinos pre-validados por Hoggax."
  }, {
    step: "03",
    title: "Coordinamos todo",
    description: "Visitas, contratos y firmas 100% digitales."
  }, {
    step: "04",
    title: "Cobrá sin preocuparte",
    description: "Renta garantizada mes a mes en tu cuenta."
  }];
  return <div className="min-h-screen bg-background">
      <Header hideSearch />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Publicá tu propiedad y <span className="text-primary">alquilá sin perder tiempo.</span>
              </h1>

              <p className="text-xl text-muted-foreground">
                Recibí solo interesados verificados y gestioná todo el alquiler de forma digital, simple y segura.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[{
                icon: Users,
                label: "Inquilinos Verificados"
              }, {
                icon: ShieldCheck,
                label: "Cobro asegurado"
              }, {
                icon: Smartphone,
                label: "100% digital"
              }, {
                icon: Award,
                label: "Pre-Calificación y Garantía Hoggax"
              }].map(item => <div key={item.label} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm uppercase tracking-wider">{item.label}</span>
                  </div>)}
              </div>
            </div>

            {/* Form Card */}
            <div id="publish-form" className="card-mob p-8">
              <h2 className="font-display text-2xl font-bold mb-6">Comenzá a publicar</h2>

              <form className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre completo
                  </label>
                  <Input placeholder="Tu nombre completo" className="mt-2 rounded-xl" />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">WhatsApp</label>
                  <Input placeholder="+54 9 11 0000 0000" className="mt-2 rounded-xl" />
                </div>

                <Button 
                  id="submit-publish-btn"
                  className="w-full rounded-xl py-6 text-base font-semibold mt-4 transition-all duration-300" 
                  onClick={handleStartPublish}
                >
                  Comenzar publicación
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Why mob Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            ¿Por qué publicar con <MobBrand />?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyPublish.map(benefit => <div key={benefit.title} className="feature-card">
                <div className="icon-container mb-6">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Beneficios</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Todo lo que necesitás para alquilar tu propiedad de forma simple, segura y sin complicaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefitsCards.map(benefit => <div key={benefit.title} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>)}
          </div>

          {/* Video Demo Placeholder */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-muted/50 border-2 border-dashed border-border rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-muted-foreground font-medium">Video demo próximamente</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            ¿Cómo funciona <MobBrand />?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map(step => <div key={step.step} className="feature-card text-center">
                <div className="text-4xl font-display font-bold text-primary/20 mb-4">{step.step}</div>
                <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>)}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold" onClick={scrollToFormAndAnimate}>
              Publicar con <span className="font-bold ml-1">mob</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Elegí cómo querés publicar tu propiedad
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Distintos niveles de acompañamiento según cuánto quieras delegar.
            </p>
          </div>

          <PricingTable handleStartPublish={handleStartPublish} scrollToFormAndAnimate={scrollToFormAndAnimate} />

          {/* Disclaimer */}
          
        </div>
      </section>

      <Footer />
    </div>;
};
export default LandingPropietarios;