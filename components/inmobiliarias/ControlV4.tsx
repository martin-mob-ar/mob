"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const mobDoes = [
  "Validación y calificación del inquilino",
  "Coordinación por WhatsApp automática",
  "Gestión de documentación",
  "Generación de contrato",
  "Firma electrónica",
];

const youDo = [
  "Elegís avanzar o no",
  "Mantenés la relación con cliente",
  "Supervisás la operación",
];

const ControlV4 = () => {
  return (
    <section className="py-12">
      <div className="container">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display mb-3 text-3xl font-bold md:text-4xl">
            <span className="font-ubuntu text-primary">mob</span> ejecuta. Vos conservás el
            control.
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Mob resuelve la parte operativa del cierre. Vos seguís decidiendo y llevando la
            relación comercial.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            className="rounded-2xl border border-primary/20 bg-primary/5 p-7"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                Mob se encarga
              </span>
            </div>
            <div className="space-y-3">
              {mobDoes.map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <Check className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2} />
                  <span className="text-sm text-foreground/80">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-border bg-card p-7"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-foreground/60" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/70">
                Tu inmobiliaria
              </span>
            </div>
            <div className="space-y-3">
              {youDo.map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 + 0.15, duration: 0.4 }}
                >
                  <Check className="h-4 w-4 flex-shrink-0 text-foreground/70" strokeWidth={2} />
                  <span className="text-sm text-foreground/80">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ControlV4;
