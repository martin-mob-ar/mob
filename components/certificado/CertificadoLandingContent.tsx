'use client';

import { motion } from 'framer-motion';
import {
  Smartphone,
  Link as LinkIcon,
  QrCode,
  Building2,
  ShieldCheck,
  Home,
} from 'lucide-react';
import { CertificadoCredencial } from './CertificadoCredencial';
import { CertificadoLandingCTA } from './CertificadoLandingCTA';

// --- Fake example data for the hero card ---
const EXAMPLE_NAME = 'Lionel Messi';
const EXAMPLE_MONTO = 2_000_000;
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

        <div className="relative container mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* The credential card (glowing spotlight) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="relative flex justify-center"
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
      <section className="relative py-12 md:py-16 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-8 md:mb-10 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary mb-2">
              Cómo funciona
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
              Tres pasos. Dos minutos.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 max-w-5xl mx-auto">
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
                {/* Header row: icon pill + "PASO 01" eyebrow + thin rule */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <step.icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  </div>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Paso {step.num}
                  </span>
                  <div aria-hidden className="h-px flex-1 bg-border/60" />
                </div>

                <h3 className="font-display text-base md:text-lg font-bold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-snug max-w-sm">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
