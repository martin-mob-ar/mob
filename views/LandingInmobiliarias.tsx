"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Cog, TrendingUp, ShieldCheck, Eye, Target, Zap, Scale, Building, FileCheck, Calendar, CreditCard, BarChart3, ArrowRight, CheckCircle, ChevronRight, Monitor, BadgeCheck } from "lucide-react";
import Image from "next/image";
import HeroFloatingCards from "@/components/inmobiliarias/HeroFloatingCards";
import FunnelComparison from "@/components/inmobiliarias/FunnelComparison";
const MobBrand = () => <span className="font-ubuntu font-bold text-primary">mob</span>;
const HoggaxBrand = () => (
  <a
    href="https://hoggax.com.ar"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 font-bold text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
  >
    Hoggax
  </a>
);

const LandingInmobiliarias = () => {
  const router = useRouter();
  const handleCTA = () => {
    router.push("/?auth=open");
  };
  const heroFeatures = ["Recibí pedidos de visita de usuarios verificados", "Garantía de alquiler aprobada por Hoggax"];
  const mobDoesCards = [{
    icon: Monitor,
    title: "Promociona tus alquileres",
    badge: "Publicá gratis",
    description: "Promocionamos todos tus alquileres. Somos la primer y única plataforma enfocada 100% en alquileres."
  }, {
    icon: ShieldCheck,
    title: "Consigue Interesados verificados",
    badge: null,
    description: "Solo recibiras interesados que hayan sido verificados y con garantía aprobada por Hoggax. Ahorra tiempo filtrando interesados. Los que recibas tienen todo lo necesario para avanzar."
  }, {
    icon: Building,
    title: "Contratos 100% online",
    badge: null,
    description: "Verificamos toda la información del inquilino, armamos el contrato, te lo mostramos para que puedas concretarlo y avanzar con la firma electrónica."
  }];
  const hoggaxBenefits = ["Documentos de identidad", "Antecedentes penales", "Situación financiera", "Capacidad de pago"];
  const hoggaxResults = ["Menos visitas improductivas", "Menos riesgo de morosidad", "Ahorra tiempo", "Mejora la experiencia de tus propietarios."];
  const metrics = [{
    value: "70%",
    label: "Menos carga operativa"
  }, {
    value: "8x",
    label: "Más cierres efectivos"
  }, {
    value: "+2.000",
    label: "Inquilinos verificados por mes"
  }, {
    value: "+10.000",
    label: "Contratos firmados"
  }];
  const benefits = [{
    icon: Cog,
    title: "Proceso operativo a cargo de mob",
    description: "Publicaciones, seguimiento y coordinación: mob lo ejecuta por vos."
  }, {
    icon: ShieldCheck,
    title: "Inquilinos aprobados antes de visitar",
    description: "Solo recibís postulantes verificados con Hoggax. Sin pérdida de tiempo."
  }, {
    icon: Scale,
    title: "Gestión legal y administrativa simple",
    description: "Contratos digitales y documentación centralizada."
  }, {
    icon: Eye,
    title: "Supervisión online, sin perder control",
    description: "Panel en tiempo real con el estado de cada propiedad y operación."
  }, {
    icon: Zap,
    title: "Más alquileres, menos operación",
    description: "Crecé tu cartera sin sumar complejidad operativa."
  }, {
    icon: Building,
    title: "Integración con Tokko",
    description: "Conectate con Tokko Broker en minutos y comenzá a recibir leads calificados automáticamente."
  }];
  const faqs = [{
    question: "¿mob reemplaza a la inmobiliaria?",
    answer: "No. mob es infraestructura operativa. Tu inmobiliaria mantiene la relación con el cliente, toma las decisiones y cierra las operaciones. Nosotros ejecutamos el proceso."
  }, {
    question: "¿Quién mantiene la relación con el cliente?",
    answer: "Tu inmobiliaria. mob trabaja en segundo plano para que vos puedas enfocarte en el vínculo comercial con propietarios e inquilinos."
  }, {
    question: "¿Tiene costo fijo?",
    answer: "No hay costos fijos de entrada. Solo participamos cuando se cierra una operación exitosa."
  }, {
    question: "¿Cómo se integran las propiedades?",
    answer: "Podés cargar propiedades manualmente desde el panel o integrar automáticamente con sistemas como Tokko."
  }];
  return <div className="min-h-screen bg-background">
      <Header hideSearch />

      {/* Hero Section */}
      <section className="py-8 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="text-primary">Digitalizá tus alquileres</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-snug">
                Verificamos y calificamos cada interesado, coordinamos la visita, armamos el contrato, y proveemos firma electrónica.
              </p>

              <div className="space-y-3">
                {heroFeatures.map(feature => <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </div>)}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold" onClick={handleCTA}>
                  Sumá tu inmobiliaria
                </Button>
              </div>
            </div>

            {/* Hero Floating Cards */}
            <HeroFloatingCards />
          </div>
        </div>
      </section>

      {/* What MOB Does Section */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Qué hace <MobBrand /> por tu inmobiliaria
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mobDoesCards.map(card => <div key={card.title} className="feature-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="icon-container">
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                  {card.badge && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold mb-4">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.description}</p>
              </div>)}
          </div>

          <div className="text-center mt-10">
            <p className="text-lg text-muted-foreground">
              <span className="font-semibold text-foreground">Ahorrá tiempo en la comercialización de tus alquileres</span>
            </p>
          </div>
        </div>
      </section>

      {/* Hoggax Verification Section */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/10">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BadgeCheck className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Verificación Hoggax</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              <span className="flex items-center gap-3 flex-wrap">
                Con el respaldo de
                <a
                  href="https://hoggax.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image src="/assets/hoggax-logo-color.svg" alt="Hoggax" width={773} height={194} className="h-[1.2em] w-auto translate-y-[0.05em]" />
                </a>
              </span>
              <span className="block">tu alquiler está seguro</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 text-foreground">Qué verificamos</h3>
                <ul className="space-y-3">
                  {hoggaxBenefits.map(benefit => <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>)}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4 text-foreground">Beneficio para tu inmobiliaria</h3>
                <ul className="space-y-3">
                  {hoggaxResults.map(result => <li key={result} className="flex items-center gap-3">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{result}</span>
                    </li>)}
                </ul>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <p className="text-lg font-medium text-center">
                Con <MobBrand /> + Hoggax, la verificación deja de ser un problema operativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funnel Comparison Section */}
      <FunnelComparison />

      {/* Execution vs Decision Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12">
              Acelerá la operación. Conservá el control. Ganá foco.
            </h2>

            {/* SIN MOB */}
            <div className="mb-10">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">SIN MOB</p>
              <div className="bg-card rounded-xl border border-border/50 p-6">
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                  <span className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium">Inmobiliaria</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                  <span className="bg-muted px-4 py-2 rounded-full text-sm">Publica</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                  <span className="bg-muted px-4 py-2 rounded-full text-sm">Filtra</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                  <span className="bg-muted px-4 py-2 rounded-full text-sm">Coordina</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                  <span className="bg-muted px-4 py-2 rounded-full text-sm">Verifica</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                  <span className="bg-muted px-4 py-2 rounded-full text-sm">Contrata</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                  <span className="bg-muted px-4 py-2 rounded-full text-sm">Administra</span>
                </div>
              </div>
            </div>

            {/* CON MOB */}
            <div className="mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">CON MOB</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* mob ejecuta */}
                <div className="bg-card rounded-xl border border-primary/20 p-6">
                  <p className="text-sm font-semibold text-primary mb-4">mob</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Publicación</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Gestión de Interesados</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Verificación</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Precalificación</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Seguimiento</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Contratos</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Administración</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Post-alquiler</span>
                  </div>
                </div>

                {/* Inmobiliaria decide */}
                <div className="bg-card rounded-xl border border-border/50 p-6">
                  <p className="text-sm font-semibold text-foreground mb-4">Inmobiliaria</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Visitas</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Supervisa</span>
                    <span className="bg-muted px-3 py-1.5 rounded-full text-sm">Relación con el cliente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Impacto real del modelo
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map(metric => <div key={metric.label} className="text-center p-6 rounded-xl bg-card border border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
                  {metric.value}
                </div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Beneficios claros para inmobiliarias
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(benefit => <div key={benefit.title} className="bg-card rounded-xl p-6 shadow-sm border border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>)}
          </div>

          {/* Benefits CTA */}
          <div className="mt-12 text-center">
            <div className="max-w-xl mx-auto bg-primary/5 rounded-xl border border-primary/10 p-8">
              <h3 className="font-display text-2xl font-bold mb-2">Empezá a publicar hoy gratis</h3>
              <p className="text-muted-foreground mb-6">En 5 min conectate y comenzá a recibir leads calificados</p>
              <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold" onClick={handleCTA}>
                Sumá tu inmobiliaria gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-muted-foreground text-lg">
                Respondemos las dudas más comunes sobre cómo funciona <MobBrand /> para inmobiliarias.
              </p>
            </div>

            <div>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-xl border border-border/50 px-6 data-[state=open]:shadow-sm">
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>)}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Acelerá la operación.
            <br />
            Conservá el control.
          </h2>

          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            <span className="font-bold">mob</span> acelera el proceso, para que cierres más rápido
          </p>

          <Button size="lg" variant="secondary" className="rounded-full px-10 py-6 text-base font-semibold" onClick={handleCTA}>
            Sumar mi inmobiliaria gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>;
};
export default LandingInmobiliarias;
