'use client';

import { motion } from 'framer-motion';
import {
  Smartphone,
  Link as LinkIcon,
  QrCode,
  Building2,
  ShieldCheck,
  Twitter,
  Home,
  BadgeCheck,
  Check,
} from 'lucide-react';
import { CertificadoCredencial } from './CertificadoCredencial';
import { CertificadoLandingCTA } from './CertificadoLandingCTA';

// --- Fake example data for the hero card ---
const EXAMPLE_NAME = 'Juana Martínez';
const EXAMPLE_MONTO = 1_500_000;
// Fake dates: emitted today-ish, valid 90 days out (set relative so the card
// always looks fresh without hard-coded strings going stale).
const nowExample = new Date();
const EXAMPLE_EMISION = nowExample.toISOString();
const EXAMPLE_VENCIMIENTO = new Date(
  nowExample.getTime() + 90 * 24 * 60 * 60 * 1000
).toISOString();

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export function CertificadoLandingContent() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          HERO — centered, card as the focal point
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Atmospheric background: faint dotted grid + primary radial glow */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(81,112,255,0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(closest-side, rgba(81,112,255,0.18), transparent 70%)',
          }}
        />

        <div className="relative container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Eyebrow */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              Certificado de inquilino · Mob + Hoggax
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="mt-6 font-display text-[2.2rem] md:text-6xl lg:text-7xl font-extrabold leading-[1.02] tracking-tight text-foreground"
            >
              El certificado que te abre la puerta del{' '}
              <span className="text-primary">alquiler</span>.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="mt-5 md:mt-6 text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Verificate una vez y recibí un certificado público con QR.
              Compartilo en X, presentálo en inmobiliarias o llevalo a la
              visita — tu aprobación de inquilino calificado, siempre a mano.
            </motion.p>

            {/* The credential card (glowing spotlight) */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="relative mt-12 md:mt-16 flex justify-center"
            >
              {/* Card-level glow */}
              <div
                aria-hidden
                className="absolute inset-0 -m-8 rounded-[32px] blur-2xl opacity-60"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(81,112,255,0.35), transparent 70%)',
                }}
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-full max-w-[540px]"
              >
                <CertificadoCredencial
                  nombreCompleto={EXAMPLE_NAME}
                  montoAprobado={EXAMPLE_MONTO}
                  fechaEmision={EXAMPLE_EMISION}
                  fechaVencimiento={EXAMPLE_VENCIMIENTO}
                  url="https://www.mob.ar/certificado/ejemplo"
                />
              </motion.div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="mt-10 md:mt-12 flex justify-center"
            >
              <CertificadoLandingCTA />
            </motion.div>

            {/* 3 tinted pills */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={fadeUp}
              className="mt-6 flex flex-wrap justify-center items-center gap-2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <Home className="h-3.5 w-3.5" />
                Apto para alquilar en mob
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Aprobado para garantía online
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700">
                <Building2 className="h-3.5 w-3.5" />
                Presentalo en inmobiliarias
              </span>
            </motion.div>

            {/* Micro trust line */}
            <motion.p
              initial="hidden"
              animate="visible"
              custom={6}
              variants={fadeUp}
              className="mt-8 text-xs text-muted-foreground"
            >
              Validación por Mob + Hoggax · Vigencia de 90 días · 100% gratis
            </motion.p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CÓMO FUNCIONA — 3 steps, editorial numerals
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-14 md:mb-20 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary mb-3">
              Cómo funciona
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground leading-[1.05]">
              Tres pasos. Dos minutos.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-5xl mx-auto">
            {[
              {
                num: '01',
                icon: Smartphone,
                title: 'Verificate en 2 minutos',
                desc: 'Respondés unos datos por WhatsApp y listo. Validamos identidad y scoring.',
              },
              {
                num: '02',
                icon: LinkIcon,
                title: 'Recibís tu link único',
                desc: 'Un certificado público con tu nombre, monto aprobado y QR de validación.',
              },
              {
                num: '03',
                icon: QrCode,
                title: 'Compartilo o escaneálo',
                desc: 'Mandálo por X, WhatsApp, o llevá el QR a la inmobiliaria.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className="relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={i}
                variants={fadeUp}
              >
                {/* Oversized background numeral */}
                <div
                  aria-hidden
                  className="absolute -top-6 -left-2 font-display text-[8rem] md:text-[9rem] font-black leading-none text-primary/10 select-none pointer-events-none"
                >
                  {step.num}
                </div>

                <div className="relative pt-14 pl-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PARA QUÉ SIRVE — dark section, 3 use cases
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 bg-warm-navy text-white overflow-hidden">
        {/* Subtle primary accent glow */}
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-30"
          style={{
            background:
              'radial-gradient(closest-side, rgba(81,112,255,0.45), transparent 70%)',
          }}
        />

        <div className="relative container mx-auto px-6">
          <motion.div
            className="text-center mb-14 md:mb-20 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary mb-3">
              Para qué sirve
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05]">
              Tu aprobación, donde la necesites.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Twitter,
                kicker: 'Hacete viral',
                title: 'Compartilo en X',
                desc: 'Mostrale al mundo que ya sos un inquilino calificado. Link + QR listos para postear.',
              },
              {
                icon: Building2,
                kicker: 'Acelerá el alquiler',
                title: 'Presentalo en inmobiliarias',
                desc: 'Llevalo a la visita y la inmobiliaria ve al instante que calificás.',
              },
              {
                icon: ShieldCheck,
                kicker: 'Sin papeleos',
                title: 'Probá tu capacidad',
                desc: 'Identidad verificada, scoring aprobado y garantía lista. Todo en un QR.',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-7 md:p-8 hover:bg-white/[0.06] transition-colors"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={i}
                variants={fadeUp}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary mb-5">
                  <card.icon className="h-6 w-6" />
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80 mb-1">
                  {card.kicker}
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold mb-3">
                  {card.title}
                </h3>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <h2 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] text-foreground mb-5">
              Empezá ahora.
              <br className="hidden md:block" />{' '}
              <span className="text-primary">Tardás 2 minutos.</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Verificate una vez, llevá tu certificado para siempre.
            </p>
            <CertificadoLandingCTA />
            <div className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Gratis
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Sin compromiso
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Vigencia 90 días
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
