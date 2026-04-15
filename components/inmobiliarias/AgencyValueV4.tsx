"use client";

import { motion } from "framer-motion";
import { Clock, FileText, ListChecks, Rocket, UserCheck } from "lucide-react";

const benefits = [
  {
    icon: UserCheck,
    title: "Dejás de revisar leads manualmente",
    desc: "Recibís avance con validación hecha, sin mirar caso por caso desde cero.",
  },
  {
    icon: ListChecks,
    title: "Evitás seguimiento operativo",
    desc: "Menos mensajes, menos recordatorios y menos tareas para empujar cada alquiler.",
  },
  {
    icon: Clock,
    title: "Reducís tiempos de cierre",
    desc: "La operación avanza más rápido cuando identidad, garantía y contrato ya están resueltos.",
  },
  {
    icon: FileText,
    title: "Menos fricción con documentación",
    desc: "Papeles y datos llegan ordenados para que el cierre no se trabe al final.",
  },
  {
    icon: Rocket,
    title: "Más operaciones concretadas",
    desc: "Tu equipo pone foco en cerrar, no en gestionar el paso a paso.",
  },
  {
    icon: UserCheck,
    title: "Solo Leads calificados",
    desc: "Identidad validada, documentación lista, perfil verificado.",
  },
];

const AgencyValueV4 = () => {
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
            Qué cambia para tu equipo
          </h2>
          <p className="text-lg text-muted-foreground">
            Menos operación manual. Más cierres concretados.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group cursor-default rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                <b.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-display mb-1 text-sm font-bold text-foreground">{b.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgencyValueV4;
