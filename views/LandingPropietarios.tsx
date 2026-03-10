"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Users, ShieldCheck, Smartphone, Award, CreditCard, TrendingUp, ArrowRight, FileCheck, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import PlanSelector from "@/components/pricing/PlanSelector";
const MobBrand = () => <span className="font-ubuntu font-bold text-primary">mob</span>;
const LandingPropietarios = () => {
  const router = useRouter();
  const {
    isAuthenticated
  } = useAuth();

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
    description: "Validamos identidad, antecedentes y perfil crediticio antes de la visita."
  }, {
    icon: Smartphone,
    title: "Proceso 100% online",
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
    description: "Interesados reales, procesos simples."
  }, {
    icon: Users,
    title: "Inquilinos verificados",
    description: "Evaluación de perfil crediticio, antecedentes y capacidad de pago por Hoggax"
  }, {
    icon: ShieldCheck,
    title: "Cobro garantizado",
    description: "Cobrás todos los meses, con respaldo de Hoggax."
  }, {
    icon: Building,
    title: "Gestión 100% digital y centralizada",
    description: "Administrá publicaciones, visitas, reservas y contratos desde un solo lugar."
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
    description: "Solo te contactan inquilinos verificados y calificados por Hoggax."
  }, {
    step: "03",
    title: "Gestioná online",
    description: "Elegís cuando podés mostrar tu departamento. Gestionás contratos y firmas 100% online."
  }, {
    step: "04",
    title: "Cobrá sin preocuparte",
    description: "Alquiler garantizado mes a mes en tu cuenta."
  }];
  return <div className="min-h-screen bg-background">
      <Header hideSearch />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl space-y-8">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Alquilá tu propiedad <span className="text-primary">con seguridad</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-snug">
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
              label: "Calificación y garantía Hoggax"
            }].map(item => <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm uppercase tracking-wider">{item.label}</span>
                </div>)}
            </div>

            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold"
              onClick={handleStartPublish}
            >
              Publicá gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
            {benefitsCards.map(benefit => <div key={benefit.title} className="bg-card rounded-xl p-6 shadow-sm border border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>)}
          </div>

          {/* Video Demo Placeholder */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-muted/50 border-2 border-dashed border-border rounded-xl aspect-video flex items-center justify-center">
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
            <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold" onClick={handleStartPublish}>
              Publicá gratis
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

          <PlanSelector selectedPlan={null} onSelectPlan={() => handleStartPublish()} />

          {/* Disclaimer */}
          
        </div>
      </section>

      <Footer />
    </div>;
};
export default LandingPropietarios;