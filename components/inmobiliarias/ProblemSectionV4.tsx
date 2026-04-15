"use client";

import { motion } from "framer-motion";
import { Clock3, FileSearch, UserX } from "lucide-react";

const pains = [
  {
    icon: UserX,
    title: "Inquilinos no aptos avanzan de más",
    desc: "No pierdas tiempo con inquilinos no aptos ni con conversaciones que no llegan al cierre.",
  },
  {
    icon: Clock3,
    title: "Seguimiento operativo que enfría la operación",
    desc: "Entre mensajes, recordatorios y validaciones, el alquiler tarda más de lo necesario.",
  },
  {
    icon: FileSearch,
    title: "Documentación incompleta o dispersa",
    desc: "Papeles, garantías y datos llegan tarde o por distintos canales y frenan el avance.",
  },
];

const ProblemSectionV4 = () => {
  return (
    <section className="bg-muted/30 py-12">
      <div className="container">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display mb-3 text-3xl font-bold md:text-4xl">
            No pierdas tiempo con inquilinos no aptos
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pains.map((pain, i) => (
            <motion.div
              key={pain.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group cursor-default rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 transition-colors group-hover:bg-destructive/15">
                <pain.icon className="h-5 w-5 text-destructive/70" strokeWidth={1.5} />
              </div>
              <h3 className="font-display mb-2 text-sm font-bold text-foreground">{pain.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{pain.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-12 text-center text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <span className="font-ubuntu font-bold text-primary">mob</span> te ayuda a cerrar el
          alquiler, con más seguridad y eficiencia
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemSectionV4;
