"use client";

import { motion } from "framer-motion";
import { UserX, MapPinOff, FileSearch, EyeOff } from "lucide-react";

const pains = [
  {
    icon: UserX,
    title: "Consultas sin preparar",
    desc: "Muchos interesados llegan sin estar listos para alquilar. Tu equipo pierde tiempo filtrando a mano.",
  },
  {
    icon: MapPinOff,
    title: "Visitas coordinadas de más",
    desc: "Mostrás propiedades sin saber si la persona realmente puede avanzar.",
  },
  {
    icon: FileSearch,
    title: "Validación manual y dispersa",
    desc: "Documentos, garantías y perfiles revisados entre WhatsApp, Excel y PDFs.",
  },
  {
    icon: EyeOff,
    title: "Propietario sin visibilidad",
    desc: "Los dueños preguntan cómo va el proceso y no tenés una respuesta clara.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            El alquiler hoy le quita tiempo a todos
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {pains.map((pain, i) => (
            <motion.div
              key={pain.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-border bg-card p-6 group cursor-default"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/15 transition-colors">
                <pain.icon className="h-5 w-5 text-destructive/70" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2 text-sm">
                {pain.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pain.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center mt-12 text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <span className="font-ubuntu font-bold text-primary">mob</span>{" "}
          ordena todo esto.{" "}
          <span className="font-semibold text-foreground">De principio a fin.</span>
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemSection;
