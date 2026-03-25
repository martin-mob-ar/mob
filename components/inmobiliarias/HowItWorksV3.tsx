"use client";

import { motion } from "framer-motion";
import { MessageCircle, Send, ScanFace, ShieldCheck, UserCheck, PenTool } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const steps = [
  {
    num: 1,
    icon: MessageCircle,
    title: "Llega un interesado",
    desc: "Por Mob directamente o derivado desde cualquier portal o red social.",
  },
  {
    num: 2,
    icon: Send,
    title: "Mob inicia el proceso",
    desc: "Todo a través de un link por WhatsApp",
  },
  {
    num: 3,
    icon: ScanFace,
    title: "Valida identidad y perfil",
    desc: "En menos de 1 minuto, con foto del DNI y datos financieros",
  },
  {
    num: 4,
    icon: ShieldCheck,
    title: "Calificamos al Lead",
    desc: "Acceso a garantía digital con 50% de descuento",
  },
  {
    num: 5,
    icon: UserCheck,
    title: "Lead listo para avanzar",
    desc: "Recibís solo interesados calificado con garantía aprobada",
  },
  {
    num: 6,
    icon: PenTool,
    title: "Firma online y cierre",
    desc: "Contrato con firma electrónica",
  },
];

const HowItWorksV3 = () => {
  const isMobile = useIsMobile();

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
            Cómo funciona <span className="font-ubuntu text-primary">mob</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Un flujo guiado, de la consulta al contrato.
          </p>
        </motion.div>

        {/* Desktop: horizontal timeline */}
        {!isMobile && (
          <div className="relative max-w-6xl mx-auto">
            {/* Connecting line */}
            <div className="absolute top-[52px] left-[60px] right-[60px] h-[2px] bg-border z-0">
              <motion.div
                className="h-full bg-primary/40 origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>

            <div className="grid grid-cols-6 gap-3 relative z-10">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="flex flex-col items-center text-center group cursor-default"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <motion.div
                    className="w-[72px] h-[72px] rounded-2xl border-2 border-primary/20 bg-card flex items-center justify-center mb-4 shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all duration-300"
                    whileHover={{ scale: 1.08, y: -4 }}
                  >
                    <step.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">
                    Paso {step.num}
                  </span>
                  <h3 className="font-display font-bold text-xs text-foreground mb-1 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile: vertical timeline */}
        {isMobile && (
          <div className="relative max-w-sm mx-auto">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-border">
              <motion.div
                className="w-full bg-primary/40 origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

            <div className="space-y-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="flex gap-4 relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <div className="w-12 h-12 rounded-xl border-2 border-primary/20 bg-card flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                    <step.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="pt-1">
                    <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">
                      Paso {step.num}
                    </span>
                    <h3 className="font-display font-bold text-sm text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mid-page text */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-muted-foreground mb-4">
            Todo esto pasa automáticamente.{" "}
            <span className="font-semibold text-foreground">Tu equipo solo decide y cierra.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksV3;
