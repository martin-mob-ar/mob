"use client";

import { motion } from "framer-motion";

const integrationItems = [
  { num: "1", text: "No cambiás tu forma de trabajar." },
  { num: "2", text: "Se integra a tu flujo actual." },
  { num: "3", text: "Operás por WhatsApp. Envías un link y comienza la operación" },
  { num: "4", text: "Sin herramientas complejas." },
];

const IntegrationV4 = () => {
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
            <span className="font-ubuntu text-primary">mob</span> te ayuda en tu operación sin
            complicarte
          </h2>
          <p className="text-lg text-muted-foreground">
            Envías un link y ordenás todo el proceso.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-5">
          {integrationItems.map((item, i) => (
            <motion.div
              key={item.num}
              className="flex items-start gap-5 rounded-xl border border-border bg-card p-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary">
                {item.num}
              </span>
              <p className="pt-1.5 text-sm text-foreground/80">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mx-auto mt-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-base text-muted-foreground">
            Podemos sincronizar Tokko Broker para mostrar tus propiedades gratis.
            <br />
            <span className="font-semibold text-foreground">
              Luego cerrás el alquiler usando mob.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationV4;
