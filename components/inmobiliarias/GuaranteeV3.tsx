"use client";

import { motion } from "framer-motion";
import { BadgeCheck, ArrowRight } from "lucide-react";
import Image from "next/image";

const verificamos = [
  "Documentos de identidad",
  "Antecedentes penales",
  "Situación financiera",
  "Capacidad de pago",
];

const beneficios = [
  "Menos visitas improductivas",
  "Menos riesgo de morosidad",
  "Ahorra tiempo",
  "Mejora la experiencia de tus propietarios.",
];

const GuaranteeV3 = () => {
  return (
    <section className="py-12 bg-muted/40">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="flex items-center gap-2.5 mb-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Verificación Hoggax
            </span>
          </motion.div>

          {/* Headline with Hoggax logo */}
          <motion.h2
            className="font-display text-3xl md:text-[2.6rem] font-bold leading-tight mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="flex items-center gap-3 flex-wrap">
              Con el respaldo de
              <a
                href="https://hoggax.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/assets/hoggax-logo-color.svg"
                  alt="Hoggax"
                  width={773}
                  height={194}
                  className="h-[1.2em] w-auto translate-y-[0.05em]"
                />
              </a>
            </span>
            <span className="block">tu alquiler está seguro</span>
          </motion.h2>

          {/* Two columns */}
          <motion.div
            className="grid md:grid-cols-2 gap-8 md:gap-12 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Qué verificamos */}
            <div>
              <h3 className="font-semibold text-foreground text-base mb-4">
                Qué verificamos
              </h3>
              <ul className="space-y-3">
                {verificamos.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <BadgeCheck className="h-[18px] w-[18px] text-primary/60 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Beneficio para tu inmobiliaria */}
            <div>
              <h3 className="font-semibold text-foreground text-base mb-4">
                Beneficio para tu inmobiliaria
              </h3>
              <ul className="space-y-3">
                {beneficios.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <ArrowRight className="h-4 w-4 text-primary/60 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Bottom banner */}
          <motion.div
            className="rounded-2xl bg-card border border-border p-5 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <p className="text-sm text-muted-foreground">
              Con <span className="text-primary font-semibold">mob</span> + Hoggax, la verificación deja de ser un problema operativo.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeV3;
