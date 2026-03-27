"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const withoutMob = [
  "Consultas dispersas sin orden",
  "Validación manual por persona",
  "Visitas coordinadas a ciegas",
  "Incertidumbre para el propietario",
  "Cierre lento y con fricciones",
];

const withMob = [
  "Flujo guiado desde el primer mensaje",
  "Validación automática e instantánea",
  "Visitas con leads ya calificados",
  "Más seguridad para el propietario",
  "Cierre más rápido, más seguro",
];

const ControlV3 = () => {
  return (
    <section className="py-12">
      <div className="container">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            <span className="font-ubuntu text-primary">mob</span> ejecuta. Vos conservás el control.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Tu equipo no pierde visibilidad. No pierde el vínculo comercial. Gana foco para lo que importa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Sin MOB */}
          <motion.div
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-7"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-destructive/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-destructive/70">
                Sin mob
              </span>
            </div>
            <div className="space-y-3">
              {withoutMob.map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <X className="h-4 w-4 text-destructive/50 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-foreground/60">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Con MOB */}
          <motion.div
            className="rounded-2xl border border-primary/20 bg-primary/5 p-7"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                Con <span className="font-ubuntu">mob</span>
              </span>
            </div>
            <div className="space-y-3">
              {withMob.map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 + 0.15, duration: 0.4 }}
                >
                  <Check className="h-4 w-4 text-primary flex-shrink-0" strokeWidth={2} />
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

export default ControlV3;
