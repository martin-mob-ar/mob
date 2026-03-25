"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CTAV3 = ({ onCTA }: { onCTA: () => void }) => {
  return (
    <section className="py-12">
      <div className="container">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Sumá tu inmobiliaria.{" "}
            <span className="text-primary">Publicá gratis</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Menos operación manual. Mejores leads. Más cierres.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-base font-semibold"
              onClick={onCTA}
            >
              Sumá tu inmobiliaria gratis
            </Button>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Ver cómo funciona
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTAV3;
