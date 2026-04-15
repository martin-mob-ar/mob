"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const metrics = [
  { value: "70%", label: "Menos carga operativa" },
  { value: "8x", label: "Más cierres efectivos" },
  { value: "+2.000", label: "Inquilinos calificados por mes" },
  { value: "+10.000", label: "Contratos firmados" },
];

const AnimatedMetric = ({ value, label, delay }: { value: string; label: string; delay: number }) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <motion.div
      className="flex min-h-[132px] flex-col items-center justify-center text-center px-6 py-8"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay, duration: 0.5, type: "spring", damping: 20 }}
      onViewportEnter={() => setHasAnimated(true)}
    >
      <motion.span
        className="font-display text-4xl md:text-5xl font-extrabold text-primary mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
      >
        {value}
      </motion.span>
      <span className="max-w-[11ch] text-sm text-muted-foreground text-center">{label}</span>
    </motion.div>
  );
};

const MetricsV3 = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <motion.h2
          className="font-display text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Cuando el alquiler se opera mejor:
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {metrics.map((m, i) => (
            <div key={m.label} className="rounded-2xl border border-border bg-card">
              <AnimatedMetric value={m.value} label={m.label} delay={i * 0.1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsV3;
