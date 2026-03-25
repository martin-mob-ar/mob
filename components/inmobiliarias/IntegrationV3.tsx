"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  "Si los leads llegan por Mob, ya entran calificados al flujo.",
  "Si llegan por otro canal, podés derivarlos rápido al proceso de Mob.",
  "Integración con Tokko Broker - sincronizamos tus propiedades",
];

const flowItems = ["mob", "Tokko", "WhatsApp"];

const IntegrationV3 = () => {
  return (
    <section className="py-12">
      <div className="container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            <span className="font-ubuntu text-primary">mob</span> te ayuda en tu operación sin complicarte
          </h2>
          <p className="text-muted-foreground text-lg">
            No tenés que cambiar todo para empezar.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4 mb-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-5 rounded-xl border border-border bg-card p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 font-display font-bold text-primary text-sm">
                {i + 1}
              </div>
              <p className="text-sm md:text-base text-foreground">{step}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {flowItems.map((item, i) => (
            <div key={item} className="flex items-center gap-4">
              {item === "mob" ? (
                <span className="text-sm font-semibold px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-ubuntu">
                  {item}
                </span>
              ) : (
                <span className="text-sm font-semibold px-4 py-2 rounded-full border border-border bg-muted text-foreground/70">
                  {item}
                </span>
              )}
              {i < flowItems.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationV3;
