"use client";

import { motion, useInView, useMotionValue, useTransform, useScroll } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { Search, Hourglass, FolderOpen, Clock, ShieldCheck, CalendarCheck, Lock, FileSignature } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const traditionalSteps = [
  { count: 100, label: "Consultas", desc: "Recibís cualquier tipo de lead, sin información del posible inquilino.", mobileDesc: "Recibís cualquier lead sin información", icon: Search },
  { count: 20, label: "Visitas", desc: "Mostrás 20 veces la propiedad sin saber si el inquilino está calificado.", mobileDesc: "20 visitas a inquilinos sin información", icon: Hourglass },
  { count: 3, label: "Prospectos", desc: "Te piden avanzar y tenés que esperar por la garantía de forma manual.", mobileDesc: "Tenés que esperar por la garantía de forma manual.", icon: FolderOpen },
  { count: 1, label: "Contrato", desc: "Esfuerzo y tiempo solo para cerrar un alquiler.", mobileDesc: "Esfuerzo y tiempo solo para cerrar un alquiler.", icon: Clock },
];

const mobSteps = [
  { count: 5, label: "Consultas", desc: "Clientes verificados y calificados por Hoggax, listos para avanzar.", mobileDesc: "Verificados y calificados por Hoggax", tag: "100% FILTRADOS", icon: ShieldCheck, hours: "12" },
  { count: 3, label: "Visitas", desc: "Coordinación de visitas online. Solo mostrás a inquilinos calificados.", mobileDesc: "Coordinás online solo con inquilinos calificados", tag: "DUE DILIGENCE", icon: CalendarCheck, hours: "8" },
  { count: 1, label: "Prospecto", desc: "Reserva online con scoring financiero aprobado.", mobileDesc: "Reserva online con scoring financiero aprobado.", tag: "RESERVA ONLINE", icon: Lock, hours: "5" },
  { count: 1, label: "Contrato", desc: "Confección y firma electrónica.", mobileDesc: "Confección y firma electrónica.", tag: "CIERRE ONLINE", icon: FileSignature, hours: "20" },
];

const EnergyPath = ({ isMob = false }: { isMob?: boolean }) => {
  return (
    <div className="flex justify-center py-0.5 relative" style={{ height: 32 }}>
      <svg width="40" height="32" viewBox="0 0 40 32" className="overflow-visible">
        <motion.path
          d={isMob ? "M 20 0 L 20 32" : "M 20 0 Q 14 8, 20 16 Q 26 24, 20 32"}
          stroke={isMob ? "hsl(var(--primary) / 0.3)" : "hsl(var(--muted-foreground) / 0.15)"}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: isMob ? 0.3 : 0.7, delay: 0.1 }}
        />
        <motion.circle
          r="2.5"
          fill={isMob ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <animateMotion
            dur={isMob ? "1s" : "2.5s"}
            repeatCount="indefinite"
            path={isMob ? "M 20 0 L 20 32" : "M 20 0 Q 14 8, 20 16 Q 26 24, 20 32"}
          />
        </motion.circle>
        {isMob && (
          <motion.circle
            r="2"
            fill="hsl(var(--primary) / 0.4)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <animateMotion
              dur="1s"
              repeatCount="indefinite"
              begin="0.5s"
              path="M 20 0 L 20 32"
            />
          </motion.circle>
        )}
      </svg>
    </div>
  );
};

const TraditionalStep = ({
  step,
  index,
  isRed,
  onHover,
}: {
  step: (typeof traditionalSteps)[0];
  index: number;
  isRed: boolean;
  onHover: (hovering: boolean) => void;
}) => (
  <motion.div
    custom={index}
    initial={{ opacity: 0, y: 30, scale: 0.97 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{
      delay: index * 0.18,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    }}
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
    className="cursor-default"
  >
    <div
      className={`flex items-start gap-4 rounded-xl border p-4 md:p-5 transition-all duration-400 ${
        isRed
          ? "border-destructive/40 bg-destructive/5"
          : "border-border bg-muted"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-400 ${
          isRed ? "bg-destructive/10" : "bg-foreground/10"
        }`}
      >
        <step.icon
          className={`h-4 w-4 transition-colors duration-400 ${
            isRed ? "text-destructive/70" : "text-foreground/50"
          }`}
          strokeWidth={1.5}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className={`font-display text-2xl font-bold tabular-nums transition-colors duration-400 ${
              isRed ? "text-destructive/60" : "text-foreground/70"
            }`}
          >
            {step.count}
          </span>
          <span
            className={`font-medium text-sm transition-colors duration-400 ${
              isRed ? "text-destructive/50" : "text-foreground/70"
            }`}
          >
            {step.label}
          </span>
        </div>
        <p
          className={`text-xs leading-relaxed transition-colors duration-400 ${
            isRed ? "text-destructive/40" : "text-foreground/50"
          }`}
        >
          {step.desc}
        </p>
      </div>
    </div>
  </motion.div>
);

const MobStep = ({
  step,
  index,
  isHighlighted,
}: {
  step: (typeof mobSteps)[0];
  index: number;
  isHighlighted: boolean;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        delay: index * 0.18,
        type: "spring",
        damping: 20,
        stiffness: 100,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.4)",
      }}
      animate={
        isHighlighted
          ? {
              scale: 1.03,
              boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.4)",
            }
          : {
              scale: 1,
              boxShadow: "0 0px 0px 0px transparent",
            }
      }
      className="cursor-default relative"
    >
      <motion.div
        className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        initial={{ opacity: 0, y: 4 }}
        animate={showTooltip ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
      >
        <span className="text-[10px] font-medium text-primary-foreground bg-primary px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
          Ahorro estimado: {step.hours}h
        </span>
      </motion.div>

      <div
        className={`flex items-start gap-4 rounded-xl border bg-card p-4 md:p-5 shadow-sm transition-all duration-500 ${
          isHighlighted
            ? "border-primary/60 ring-1 ring-primary/20"
            : "border-primary/20 hover:border-primary/40"
        }`}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-primary/10">
          <step.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-2xl font-bold text-foreground tabular-nums">
              {step.count}
            </span>
            <span className="font-medium text-foreground text-sm">
              {step.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.desc}
          </p>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0 mt-1">
          {step.tag}
        </span>
      </div>
    </motion.div>
  );
};

const FunnelComparison = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const [isMobHovered, setIsMobHovered] = useState(false);
  const [hoveredTraditionalIndex, setHoveredTraditionalIndex] = useState<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [isMobile, mouseX, mouseY]
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const progressHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {!isMobile && (
        <div className="absolute right-0 top-0 bottom-0 w-[3px] z-20">
          <div className="w-full h-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-primary/60 rounded-full origin-top"
              style={{ height: progressHeight }}
            />
          </div>
        </div>
      )}

      <div className="container relative z-10">
        {/* Mobile: Combined compact view */}
        {isMobile && (
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="grid grid-cols-2 gap-3 mb-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Tradicional
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  Con <span className="font-ubuntu">mob</span>
                </span>
              </div>
            </motion.div>

            <div className="space-y-2.5">
              {traditionalSteps.map((tStep, i) => {
                const mStep = mobSteps[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20, scale: 0.96 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      delay: i * 0.1,
                      duration: 0.5,
                      type: "spring",
                      damping: 20,
                      stiffness: 120,
                    }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <motion.div
                      className="rounded-xl border border-border bg-muted p-3 flex flex-col gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.05, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
                          <tStep.icon className="h-3 w-3 text-foreground/50" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-display text-lg font-bold text-foreground/70 tabular-nums">
                            {tStep.count}
                          </span>
                          <span className="text-[11px] text-foreground/60 ml-1">
                            {tStep.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11.5px] text-foreground/55 leading-relaxed">
                        {tStep.mobileDesc}
                      </p>
                    </motion.div>

                    <motion.div
                      className="rounded-xl border border-primary/20 bg-card p-3 flex flex-col gap-2 shadow-sm"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.1, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <mStep.icon className="h-3 w-3 text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-display text-lg font-bold text-foreground tabular-nums">
                            {mStep.count}
                          </span>
                          <span className="text-[11px] text-foreground/80 ml-1">
                            {mStep.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11.5px] text-foreground/65 leading-relaxed">
                        {mStep.mobileDesc}
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop: Grid */}
        {!isMobile && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 gap-10">
              {/* Traditional */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Proceso tradicional
                  </span>
                </div>
                <div className="space-y-0">
                  {traditionalSteps.map((step, i) => (
                    <div key={step.label + i}>
                      <TraditionalStep
                        step={step}
                        index={i}
                        isRed={isMobHovered || hoveredTraditionalIndex === i}
                        onHover={(h) => setHoveredTraditionalIndex(h ? i : null)}
                      />
                      {i < traditionalSteps.length - 1 && <EnergyPath />}
                    </div>
                  ))}
                </div>
              </div>

              {/* mob */}
              <div
                onMouseEnter={() => setIsMobHovered(true)}
                onMouseLeave={() => setIsMobHovered(false)}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                    Proceso con <span className="font-ubuntu">mob</span>
                  </span>
                </div>
                <div className="space-y-0">
                  {mobSteps.map((step, i) => (
                    <div key={step.label + i}>
                      <MobStep
                        step={step}
                        index={i}
                        isHighlighted={hoveredTraditionalIndex !== null}
                      />
                      {i < mobSteps.length - 1 && <EnergyPath isMob />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="rounded-full px-8 py-6 text-base font-semibold"
            asChild
          >
            <a href="https://tally.so/r/5Bk4y6" target="_blank" rel="noopener noreferrer">
              Suma tu inmobiliaria gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FunnelComparison;
