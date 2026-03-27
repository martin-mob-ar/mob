"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import HeroFloatingCards from "@/components/inmobiliarias/HeroFloatingCards";
import ProblemSection from "@/components/inmobiliarias/ProblemSection";
import HowItWorksV3 from "@/components/inmobiliarias/HowItWorksV3";
import FunnelComparison from "@/components/inmobiliarias/FunnelComparison";
import GuaranteeV3 from "@/components/inmobiliarias/GuaranteeV3";
import AgencyValueV3 from "@/components/inmobiliarias/AgencyValueV3";
import ControlV3 from "@/components/inmobiliarias/ControlV3";
import MetricsV3 from "@/components/inmobiliarias/MetricsV3";
import IntegrationV3 from "@/components/inmobiliarias/IntegrationV3";
import CTAV3 from "@/components/inmobiliarias/CTAV3";
import AboutV3 from "@/components/inmobiliarias/AboutV3";
import FAQV3 from "@/components/inmobiliarias/FAQV3";

const heroFeatures = [
  "Recibí solo interesados calificados",
  "Garantía de alquiler aprobada por Hoggax",
  "Descuento de 50% en garantía para los inquilinos",
];

const whatsappUrl = "https://wa.me/5492236000055";
const tallyUrl = "https://tally.so/r/5Bk4y6";

const LandingInmobiliarias = () => {

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Header hideSearch landingCta="Sumá tu inmobiliaria" />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="text-primary">Digitalizá tus alquileres</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Verificamos y calificamos interesados, gestionamos la garantía y armamos el contrato. Conectado con WhatsApp. Vos supervisás y cerrás.
              </p>

              <div className="space-y-3">
                {heroFeatures.map((feature, i) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Button
                  size="lg"
                  className="rounded-full px-8 py-6 text-base font-semibold"
                  asChild
                >
                  <a href={tallyUrl} target="_blank" rel="noopener noreferrer">
                    Sumá tu inmobiliaria gratis
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base"
                  asChild
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Hablar con un asesor
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Hero Floating Cards */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <HeroFloatingCards />
            </motion.div>
          </div>
        </div>
      </section>

      <ProblemSection />

      <div id="how-it-works">
        <HowItWorksV3 />
      </div>

      <FunnelComparison />

      <GuaranteeV3 />

      <AgencyValueV3 />

      <ControlV3 />

      <MetricsV3 />

      <IntegrationV3 />

      <CTAV3 />

      <AboutV3 />

      <FAQV3 />

      <Footer />
    </div>
  );
};

export default LandingInmobiliarias;
