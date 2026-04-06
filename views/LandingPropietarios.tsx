"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import PlanSelector from "@/components/pricing/PlanSelector";
import {
  Users, ShieldCheck, Smartphone, Award, ArrowRight,
  Check, Upload, UserCheck, ClipboardCheck, Wallet,
  MessageCircle, ScanFace,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GarantiaTooltip } from "@/components/GarantiaTooltip";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MobBrand = () => (
  <span className="font-ubuntu font-bold text-primary">mob</span>
);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const founders = [
  {
    name: "Iñaki Valencia",
    role: "Cofundador",
    photo: "/assets/propietarios/foto_perfil.png",
    bio: "Vengo de familia inmobiliaria, donde trabajé a los 16 años",
    credentials: [
      "Lic. en Negocios Digitales - UdeSA",
      "Ex Cofundador de Roomix.ai",
    ],
    email: "inaki@mob.ar",
    linkedin: "https://www.linkedin.com/in/inaki-valencia/",
    whatsapp: "https://wa.me/+5492236000055",
  },
  {
    name: "Martín Quijano",
    role: "Cofundador",
    photo: "/assets/propietarios/foto_perfil_martin.png",
    bio: "Programo desde los 15. También vengo de familia inmobiliaria",
    credentials: [
      "Lic. en Negocios Digitales - UdeSA",
      "Ex Cofundador de Tuni.com.ar",
    ],
    email: "martin@mob.ar",
    linkedin: "https://www.linkedin.com/in/martin-quijano-/",
  },
];

const LandingPropietarios = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleCTA = () => {
    router.push("/subir-propiedad?from=propietarios");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header hideSearch landingCta="Publicá gratis" />

      {/* ═══ HERO ═══ */}
      <section className="relative bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="px-0 pb-9 pt-0 md:px-12 md:py-24 lg:px-16 xl:px-24 flex items-center">
            <div className="space-y-8 max-w-xl">
              <div className="lg:hidden relative w-full h-[240px]">
                <Image
                  src="/assets/propietarios/foto_hero_propietarios.jpeg"
                  alt="Propietaria relajada usando mob desde su hogar"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="px-6 md:px-0 space-y-[26px] md:space-y-8">
                <h1 className="font-display text-[1.8rem] md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
                  Alquilá tu propiedad con{" "}
                  <span className="text-primary">seguridad</span>
                </h1>
                <p className="text-[0.95rem] md:text-xl text-muted-foreground">
                  Recibí solo interesados verificados y gestioná todo el
                  alquiler de forma digital, simple y segura.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: "Inquilinos verificados" },
                    { icon: ShieldCheck, label: "Cobro asegurado" },
                    { icon: Smartphone, label: "100% digital" },
                    { icon: Award, label: "Calificación y garantía Hoggax" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="rounded-full px-10 py-6 text-base font-semibold shadow-lg shadow-primary/20"
                  onClick={handleCTA}
                >
                  Publicá gratis
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative min-h-[560px]">
            <Image
              src="/assets/propietarios/foto_hero_propietarios.jpeg"
              alt="Propietaria relajada usando mob desde su hogar"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ═══ EMOTIONAL VALUE PROPOSITION ═══ */}
      <section className="pt-8 pb-12 md:pt-12 md:pb-12 bg-background">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold mb-4 text-foreground">
              Tu propiedad, en buenas manos.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                image: "/assets/propietarios/inqCalif.png",
                title: "Solo inquilinos verificados",
                desc: "Validamos identidad, antecedentes y capacidad de pago antes de que veas a alguien.",
              },
              {
                image: "/assets/propietarios/cobro.png",
                title: "Cobro garantizado todos los meses",
                desc: "Con el respaldo de Hoggax, tu alquiler llega puntual aunque el inquilino se atrase.",
              },
              {
                image: "/assets/propietarios/procesoDig.png",
                title: "Proceso 100% digital, sin papeles",
                desc: "Desde la visita hasta el contrato firmado, todo online. Sin reuniones, sin filas, sin caos.",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                className="bg-white rounded-2xl p-6 md:p-8 border border-border/30 shadow-sm hover:shadow-md transition-shadow"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  width={80}
                  height={80}
                  className="w-14 h-14 md:w-20 md:h-20 object-contain mb-4 md:mb-6"
                />
                <h3 className="font-display text-lg md:text-xl font-bold mb-2 md:mb-3 text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-12 md:py-12 bg-background">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold mb-4 text-foreground">
              ¿Cómo funciona <MobBrand />?
            </h2>
            <p className="text-lg text-muted-foreground">
              Cuatro pasos. Vos solo hacés el primero.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {/* Desktop horizontal */}
            <div className="hidden md:block relative">
              <div className="absolute top-[35px] left-[80px] right-[80px] h-[2px] bg-border z-0">
                <motion.div
                  className="h-full bg-primary/30 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <div className="grid grid-cols-4 gap-6 relative z-10">
                {[
                  {
                    num: "01",
                    icon: Upload,
                    title: "Publicá tu propiedad",
                    desc: "Cargá fotos, descripción y precio en minutos. Nosotros nos encargamos del resto.",
                  },
                  {
                    num: "02",
                    icon: UserCheck,
                    title: "Recibí interesados verificados",
                    desc: "Solo te contactamos con inquilinos calificados y verificados por Hoggax. Sin filtrar a mano.",
                  },
                  {
                    num: "03",
                    icon: ClipboardCheck,
                    title: "Gestionamos todo online",
                    desc: "Agendamos visitas, coordinamos reservas y preparamos el contrato digital. Vos aprobás y listo.",
                  },
                  {
                    num: "04",
                    icon: Wallet,
                    title: "Cobrá sin preocuparte",
                    desc: "Alquiler garantizado todos los meses en tu cuenta. Puntual y seguro.",
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.num}
                    className="flex flex-col items-center text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={fadeUp}
                  >
                    <div className="w-[72px] h-[72px] rounded-2xl border-2 border-primary/20 bg-card flex items-center justify-center mb-5 shadow-sm">
                      <step.icon
                        className="h-7 w-7 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <span className="text-3xl font-display font-extrabold text-primary/20 mb-2">
                      {step.num}
                    </span>
                    <h3 className="font-display font-bold text-base text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile vertical */}
            <div className="md:hidden space-y-6 relative">
              <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-border">
                <motion.div
                  className="w-full bg-primary/30 origin-top"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                />
              </div>
              {[
                {
                  num: "01",
                  icon: Upload,
                  title: "Publicá tu propiedad",
                  desc: "Cargá fotos, descripción y precio en minutos.",
                },
                {
                  num: "02",
                  icon: UserCheck,
                  title: "Recibí interesados verificados",
                  desc: "Solo inquilinos calificados y verificados por Hoggax.",
                },
                {
                  num: "03",
                  icon: ClipboardCheck,
                  title: "Gestionamos todo online",
                  desc: "Visitas, reservas y contrato digital. Vos aprobás.",
                },
                {
                  num: "04",
                  icon: Wallet,
                  title: "Cobrá sin preocuparte",
                  desc: "Alquiler garantizado mes a mes en tu cuenta.",
                },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  className="flex gap-4 relative"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                >
                  <div className="w-12 h-12 rounded-xl border-2 border-primary/20 bg-card flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                    <step.icon
                      className="h-5 w-5 text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="pt-1">
                    <span className="text-xs font-bold text-primary/50 uppercase tracking-widest">
                      Paso {step.num}
                    </span>
                    <h3 className="font-display font-bold text-base text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="text-center mt-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-base font-semibold shadow-lg shadow-primary/20"
              onClick={handleCTA}
            >
              Publicá tu propiedad gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ HOGGAX GUARANTEE (dark navy) ═══ */}
      <section className="py-20 md:py-28 bg-warm-navy text-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold mb-4">
              Cobrás siempre, garantizado
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              <MobBrand /> trabaja con{" "}
              <a
                href="https://hoggax.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white underline-offset-4 hover:underline"
              >
                Hoggax
              </a>{" "}
              para que tu cobro esté siempre protegido.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: ScanFace,
                title: "Verificamos al inquilino",
                desc: "Identidad, antecedentes penales, situación financiera y capacidad de pago.",
              },
              {
                icon: Award,
                title: <GarantiaTooltip>Garantía 50% off</GarantiaTooltip>,
                desc: "Tu inquilino puede acceder a garantía a mitad de precio, lo que hace más atractivo tu alquiler.",
              },
              {
                icon: ShieldCheck,
                title: "Garantizamos el cobro",
                desc: "Si el inquilino no paga, Hoggax cubre. Tu dinero llega igual.",
              },
            ].map((col, i) => (
              <motion.div
                key={i}
                className="text-center md:text-left"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center mb-4 md:mb-5 mx-auto md:mx-0">
                  <col.icon
                    className="h-5 w-5 md:h-7 md:w-7 text-white/80"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-display text-base md:text-lg font-bold mb-1.5 md:mb-2">
                  {col.title}
                </h3>
                <p className="text-white/60 leading-relaxed text-[13px] md:text-sm">
                  {col.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLANS ═══ */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold mb-4 text-foreground">
              Elegí cómo querés publicar tu propiedad
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Distintos niveles de acompañamiento según cuánto quieras delegar.
            </p>
          </motion.div>

          <PlanSelector selectedPlan={null} onSelectPlan={() => {}} showSelectButtons={false} showCostNote={false} />

          {/* Plan CTA buttons */}
          <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr] mt-6 max-w-5xl mx-auto">
            <div />
            {[
              { label: "Elegir básico", variant: "outline" as const },
              { label: "Elegir acompañado", variant: "outline" as const },
              { label: "Quiero gestión completa", variant: "default" as const },
            ].map((plan) => (
              <div key={plan.label} className="px-2 flex justify-center">
                <Button
                  variant={plan.variant}
                  size="lg"
                  className="rounded-full w-full"
                  onClick={handleCTA}
                >
                  {plan.label}
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              El costo se cobra únicamente cuando el alquiler se concreta.
            </p>
            <p className="text-sm font-medium text-muted-foreground">No hay costos iniciales.</p>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-12 bg-white">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold mb-4 text-foreground">
              Tu propiedad merece un proceso simple y seguro.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Publicá gratis hoy y recibí tu primer inquilino verificado.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                size="lg"
                className="rounded-full px-10 py-6 text-base font-semibold shadow-lg shadow-primary/20 w-full sm:w-auto"
                onClick={handleCTA}
              >
                Publicá tu propiedad gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80 w-full sm:w-auto"
                asChild
              >
                <a
                  href="https://wa.me/5491100000000"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Hablar con un asesor
                </a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Sin costo inicial
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Inquilinos
                verificados
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Cobro garantizado
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-12 bg-background">
        <div className="container">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
              Preguntas frecuentes
            </h2>
          </motion.div>

          <motion.div
            className="max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "¿Cuánto cuesta publicar mi propiedad?",
                  a: "Publicar es gratis. Solo cobramos por el costo de la plataforma cuando el alquiler se concreta. Sin costos iniciales ni sorpresas.",
                },
                {
                  q: "¿Cómo verifican a los inquilinos?",
                  a: "Validamos identidad, antecedentes penales, situación financiera y capacidad de pago antes de que el interesado pueda avanzar.",
                },
                {
                  q: "¿Qué pasa si el inquilino no paga?",
                  a: "Con el respaldo de Hoggax, tu alquiler está garantizado. Si el inquilino se atrasa, vos cobrás igual.",
                },
                {
                  q: "¿Tengo que hacer algo durante el proceso?",
                  a: "Solo publicás tu propiedad y confirmás al inquilino. El resto: coordinación de visitas, documentación, pago y contrato lo gestionamos nosotros.",
                },
                {
                  q: "¿El contrato tiene validez legal?",
                  a: "Sí. El contrato digital de MOB tiene plena validez legal en Argentina.",
                },
              ].map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border rounded-xl px-6 bg-card data-[state=open]:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="text-[15px] font-semibold text-foreground hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section className="py-8 md:py-10 bg-background">
        <div className="container">
          <motion.div
            className="text-center mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-foreground">
              Quiénes somos
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {founders.map((founder, i) => (
              <motion.div
                key={founder.name}
                className="text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <div className="rounded-[1.25rem] overflow-hidden bg-accent/40 mb-3 shadow-sm">
                  <Image
                    src={founder.photo}
                    alt={founder.name}
                    width={400}
                    height={405}
                    className="w-full aspect-[4/4.05] object-cover"
                  />
                </div>

                <h3 className="font-display text-lg md:text-xl font-extrabold text-foreground leading-tight">
                  {founder.name}
                </h3>
                <p className="font-display text-lg md:text-xl font-extrabold text-foreground leading-tight mb-3">
                  {founder.role}
                </p>

                <p className="font-display max-w-[15rem] mx-auto text-[13px] md:text-sm leading-[1.45] text-foreground/90 mb-4">
                  {founder.bio}
                </p>

                <div className="font-display space-y-0.5 text-[13px] md:text-sm leading-[1.35] text-foreground">
                  {founder.credentials.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                  {(founder.email || founder.linkedin) && (
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {founder.email && <span>{founder.email}</span>}
                      {founder.email && founder.linkedin && <span>|</span>}
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-foreground hover:text-primary transition-colors"
                          aria-label={`LinkedIn de ${founder.name}`}
                        >
                          <Image
                            src="/assets/propietarios/linkedin_icon.png"
                            alt="LinkedIn"
                            width={16}
                            height={16}
                            className="h-4 w-4 object-contain"
                          />
                        </a>
                      )}
                    </div>
                  )}
                  {founder.whatsapp && (
                    <p>
                      <a
                        href={founder.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Si tenes dudas, acá esta mi WhatsApp
                      </a>
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="max-w-3xl mx-auto text-center mt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-5">
              Con el apoyo de:
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-11">
              <Image
                src="/assets/propietarios/hoggax_negro.png"
                alt="Hoggax"
                width={200}
                height={52}
                className="h-11 md:h-[52px] w-auto object-contain opacity-85"
              />
              <Image
                src="/assets/propietarios/udesa.png"
                alt="UdeSA"
                width={200}
                height={60}
                className="h-[52px] md:h-[60px] w-auto object-contain opacity-85"
              />
              <Image
                src="/assets/propietarios/centroudesa.png"
                alt="Centro de Entrepreneurship UdeSA"
                width={200}
                height={60}
                className="h-[52px] md:h-[60px] w-auto object-contain opacity-85"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPropietarios;
