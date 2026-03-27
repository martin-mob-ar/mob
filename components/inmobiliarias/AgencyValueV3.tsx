"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, UserCheck, FileX, LayoutDashboard, Rocket } from "lucide-react";

const benefits = [
  { icon: Clock, title: "Menos tiempo operativo", desc: "Tu equipo deja de gestionar lo que Mob puede hacer solo." },
  { icon: MapPin, title: "Menos visitas inútiles", desc: "Solo avanzás con interesados que ya están listos." },
  { icon: UserCheck, title: "Solo Leads calificados", desc: "Identidad validada, documentación lista, perfil verificado." },
  { icon: FileX, title: "Menos validación manual", desc: "Sin revisar papeles ni perseguir garantías a mano." },
  { icon: LayoutDashboard, title: "Más orden en el seguimiento", desc: "Todo el proceso en un solo lugar, sin herramientas dispersas." },
  { icon: Rocket, title: "Más cierres, menos fricción", desc: "El proceso avanza solo. Vos cerrás el trato." },
];

const AgencyValueV3 = () => {
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
            Qué cambia para tu equipo
          </h2>
          <p className="text-muted-foreground text-lg">
            No es solo más digital. Es una operación mejor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-xl border border-border bg-card p-5 cursor-default group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                <b.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-sm text-foreground mb-1">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgencyValueV3;
