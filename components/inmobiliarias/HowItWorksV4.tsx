"use client";

import { motion } from "framer-motion";
import {
  FileCheck,
  FileText,
  Link2,
  MessageCircleMore,
  PenTool,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const steps = [
  {
    num: 1,
    icon: Link2,
    title: "Pegás link de tu ficha",
  },
  {
    num: 2,
    icon: Users,
    title: "Ingresás el número del inquilino y propietario",
  },
  {
    num: 3,
    icon: MessageCircleMore,
    title: "Contactamos y pedimos datos",
  },
  {
    num: 4,
    icon: UserRoundCheck,
    title: "Calificamos y aprobamos al inquilino",
  },
  {
    num: 5,
    icon: FileCheck,
    title: "Recolectamos documentación",
  },
  {
    num: 6,
    icon: ShieldCheck,
    title: "Emitimos garantía con Hoggax",
  },
  {
    num: 7,
    icon: FileText,
    title: "Generamos contrato",
  },
  {
    num: 8,
    icon: PenTool,
    title: "Firmás electrónicamente",
  },
];

const desktopRows = [steps.slice(0, 4), steps.slice(4, 8)];

const HowItWorksV4 = () => {
  const isMobile = useIsMobile();

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
            Cómo funciona <span className="font-ubuntu text-primary">mob</span>
          </h2>
        </motion.div>

        {!isMobile && (
          <div className="mx-auto max-w-5xl space-y-12">
            {desktopRows.map((row, rowIndex) => (
              <div key={rowIndex} className="relative">
                <div className="absolute left-[60px] right-[60px] top-[52px] z-0 h-[2px] bg-border">
                  <motion.div
                    className="h-full origin-left bg-primary/40"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: rowIndex * 0.1 }}
                  />
                </div>

                <div className="relative z-10 grid grid-cols-4 gap-8">
                  {row.map((step, i) => (
                    <motion.div
                      key={step.num}
                      className="group flex cursor-default flex-col items-center px-2 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: (rowIndex * 4 + i) * 0.08, duration: 0.5 }}
                    >
                      <motion.div
                        className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 border-primary/20 bg-card shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-md"
                        whileHover={{ scale: 1.08, y: -4 }}
                      >
                        <step.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                      </motion.div>
                      <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                        Paso {step.num}
                      </span>
                      <h3 className="font-display mx-auto max-w-[14ch] text-base font-bold leading-snug text-foreground">
                        {step.title}
                      </h3>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {isMobile && (
          <div className="relative mx-auto max-w-sm">
            <div className="absolute bottom-0 left-[23px] top-0 w-[2px] bg-border">
              <motion.div
                className="origin-top w-full bg-primary/40"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

            <div className="space-y-7">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="relative flex gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <div className="z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-primary/20 bg-card shadow-sm">
                    <step.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="pt-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">
                      Paso {step.num}
                    </span>
                    <h3 className="font-display max-w-[18ch] text-base font-bold leading-snug text-foreground">
                      {step.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              Mob empuja la operación hasta el cierre.
            </span>{" "}
            Vos decidís.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksV4;
