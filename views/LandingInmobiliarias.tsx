"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  PenLine,
  Shield,
  Tag,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { GarantiaTooltip } from "@/components/GarantiaTooltip";
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

const heroTags = [
  { icon: UserCheck, label: "Solo interesados calificados" },
  { icon: Shield, label: "Garantía aprobada por Hoggax" },
  { icon: Tag, label: "50% off en garantía" },
  { icon: Calendar, label: "Coordinación de visitas" },
  { icon: FileText, label: "Documentación online" },
  { icon: PenLine, label: "Firma electrónica" },
];

const whatsappUrl = "https://wa.me/5492236000055";
const tallyUrl = "https://tally.so/r/5Bk4y6";

const LandingInmobiliarias = () => {

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Header hideSearch landingCta="Sumá tu inmobiliaria" />

      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="px-0 pb-9 pt-0 md:px-12 md:py-24 lg:px-16 xl:px-24 flex items-center">
            <motion.div
              className="space-y-8 max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Mobile image */}
              <div className="lg:hidden">
                <Image
                  src="/assets/inmobiliario.png"
                  alt="Asesor inmobiliario trabajando con la plataforma de mob"
                  width={800}
                  height={480}
                  className="w-full h-[240px] object-cover"
                  priority
                />
              </div>

              <div className="px-6 md:px-0 space-y-[26px] md:space-y-8">
                <h1 className="font-display text-[1.8rem] md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
                  <span className="inline md:block">Digitalizá tus</span>
                  <span className="inline md:block text-primary">
                    {" "}
                    alquileres
                  </span>
                </h1>

                <p className="text-[0.95rem] md:text-xl text-muted-foreground max-w-lg">
                  Verificamos y calificamos interesados, gestionamos la garantía
                  y armamos el contrato. Conectado con WhatsApp. Vos supervisás
                  y cerrás.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {heroTags.map(({ icon: Icon, label }, i) => (
                    <motion.div
                      key={label}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-primary" />
                      {label === "50% off en garantía" ? (
                        <GarantiaTooltip className="inline-flex items-center gap-1 cursor-help font-medium text-sm text-foreground whitespace-nowrap">
                          {label}
                        </GarantiaTooltip>
                      ) : (
                        <span
                          className={`font-medium text-sm text-foreground ${label === "Garantía aprobada por Hoggax" ? "md:whitespace-nowrap" : ""}`}
                        >
                          {label}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="flex flex-col gap-3 sm:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Button
                    size="lg"
                    className="h-12 rounded-full px-6 text-sm font-semibold sm:w-auto"
                    asChild
                  >
                    <a
                      href={tallyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Sumá tu inmobiliaria gratis
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full px-6 text-sm font-medium sm:w-auto"
                    asChild
                  >
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Hablá con nuestro equipo
                    </a>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Desktop image */}
          <motion.div
            className="hidden lg:block relative min-h-[560px]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image
              src="/assets/inmobiliario.png"
              alt="Asesor inmobiliario trabajando con la plataforma de mob"
              fill
              className="object-cover object-center"
              priority
            />
          </motion.div>
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
