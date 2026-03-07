"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, Building2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const propietariosBullets = [
  { title: "Inquilinos verificados", desc: "Validamos identidad, antecedentes y perfil crediticio antes de la visita." },
  { title: "Proceso 100% online", desc: "Agenda de visitas, contratos digitales y gestión centralizada." },
  { title: "Cobro garantizado", desc: "Cobrás todos los meses en tiempo y forma gracias al respaldo de Hoggax." },
];

const inmobiliariasBullets = [
  { title: "Interesados verificados", desc: "Solo recibís postulantes con identidad validada y garantía aprobada." },
  { title: "Contratos 100% online", desc: "Verificamos la información del inquilino y armamos el contrato listo para firma." },
  { title: "Integración con Tokko Broker", desc: "Conectá tus propiedades en minutos y recibí solo leads calificados." },
];

interface AudienceCardProps {
  label: string;
  icon: React.ReactNode;
  title: string;
  highlight: string;
  support: string;
  bullets: { title: string; desc: string }[];
  ctaText: string;
  ctaHref: string;
  delay: number;
  visible: boolean;
  accent?: boolean;
  side: "left" | "right";
  dimmed: boolean;
  disclaimer?: string;
}

const AudienceCard = ({
  label,
  icon,
  title,
  highlight,
  support,
  bullets,
  ctaText,
  ctaHref,
  delay,
  visible,
  accent,
  side,
  dimmed,
  disclaimer,
}: AudienceCardProps) => {
  const titleParts = title.split(highlight);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 8,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 8,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        group/card relative overflow-hidden rounded-3xl flex flex-col h-full
        transition-all duration-400 ease-out
        ${visible
          ? "opacity-100 translate-x-0 translate-y-0"
          : `opacity-0 ${side === "left" ? "-translate-x-10" : "translate-x-10"} translate-y-4`}
        ${dimmed ? "opacity-70 scale-[0.98]" : "opacity-100 scale-100"}
        hover:-translate-y-1.5 hover:scale-[1.01]
      `}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
        background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: dimmed
          ? "0 4px 20px -4px hsl(var(--foreground) / 0.05)"
          : "0 8px 40px -8px hsl(var(--primary) / 0.08), 0 2px 12px -2px hsl(var(--foreground) / 0.04)",
      }}
    >
      {/* Gradient border overlay */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-400"
        style={{
          padding: "1px",
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05), transparent, hsl(var(--primary) / 0.08))",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "xor",
          WebkitMaskComposite: "xor",
          opacity: dimmed ? 0.3 : 1,
        }}
      />

      {/* Hover glow border */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-400"
        style={{
          padding: "1.5px",
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.3))",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "xor",
          WebkitMaskComposite: "xor",
        }}
      />

      {/* Animated background blobs */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / ${accent ? 0.08 : 0.05}) 0%, transparent 70%)`,
          transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px) scale(${dimmed ? 0.8 : 1})`,
        }}
      />
      <div
        className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / ${accent ? 0.06 : 0.03}) 0%, transparent 70%)`,
          transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`,
        }}
      />

      {/* Center spotlight on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${50 + mousePos.x * 5}% ${50 + mousePos.y * 5}%, hsl(var(--primary) / 0.04), transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative p-10 md:p-14 flex flex-col flex-1">
        {/* Label pill */}
        <span
          className={`
            inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-base font-bold mb-8 w-fit
            bg-primary/10 text-primary
            transition-all duration-300
            ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          `}
          style={{ transitionDelay: visible ? `${delay + 100}ms` : "0ms" }}
        >
          {icon}
          {label}
        </span>

        {/* Title */}
        <h3
          className={`font-display text-3xl md:text-[2.1rem] font-bold text-foreground leading-tight mb-3 transition-all duration-400 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{ transitionDelay: visible ? `${delay + 150}ms` : "0ms" }}
        >
          {titleParts[0]}
          <span className="text-primary transition-colors duration-300 group-hover/card:brightness-110">
            {highlight}
          </span>
          {titleParts[1] || ""}
        </h3>

        {/* Support line */}
        <p
          className={`text-muted-foreground text-base mb-8 transition-all duration-400 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{ transitionDelay: visible ? `${delay + 200}ms` : "0ms" }}
        >
          {support}
        </p>

        {/* Bullets */}
        <ul className="space-y-5 mb-10 flex-1">
          {bullets.map((b, i) => (
            <li
              key={b.title}
              className={`flex items-start gap-3.5 text-base transition-all duration-400 ${
                visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
              style={{ transitionDelay: visible ? `${delay + 280 + i * 60}ms` : "0ms" }}
            >
              <span
                className={`
                  flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 shrink-0 mt-0.5
                  transition-all duration-500
                  ${visible ? "scale-100" : "scale-50"}
                  group-hover/card:bg-primary/15
                `}
                style={{ transitionDelay: visible ? `${delay + 300 + i * 60}ms` : "0ms" }}
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </span>
              <div>
                <span className="font-semibold text-foreground">{b.title}</span>
                <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">{b.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Disclaimer */}
        {disclaimer && (
          <p
            className={`text-muted-foreground text-xs mb-3 transition-all duration-400 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{ transitionDelay: visible ? `${delay + 480}ms` : "0ms" }}
          >
            {disclaimer}
          </p>
        )}

        {/* CTA */}
        <Link
          href={ctaHref}
          className={`mt-auto transition-all duration-400 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: visible ? `${delay + 500}ms` : "0ms" }}
        >
          <Button
            size="lg"
            className="
              w-full relative overflow-hidden text-base font-bold py-4 px-8
              transition-all duration-300 ease-out
              hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/20
              active:scale-[0.98] active:duration-100
            "
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(227 100% 72%) 100%)",
            }}
          >
            <span className="relative z-10">{ctaText}</span>
            {/* Hover shimmer */}
            <span
              className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/card:translate-x-[100%]"
              style={{ transition: "transform 0.8s ease-out, opacity 0.3s" }}
            />
          </Button>
        </Link>
      </div>
    </div>
  );
};

const DualCTA = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<"left" | "right" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-20 overflow-hidden md:py-[70px]">
      {/* Animated ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left glow */}
        <div
          className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full opacity-30 transition-opacity duration-700"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
            animation: "audience-float-1 12s ease-in-out infinite",
            opacity: hoveredCard === "left" ? 0.5 : 0.3,
          }}
        />
        {/* Right glow */}
        <div
          className="absolute -right-32 top-1/3 h-[450px] w-[450px] rounded-full opacity-25 transition-opacity duration-700"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
            animation: "audience-float-2 10s ease-in-out infinite",
            opacity: hoveredCard === "right" ? 0.45 : 0.25,
          }}
        />
        {/* Center subtle line */}
        <div
          className="hidden md:block absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2"
          style={{
            background: "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.08), transparent)",
          }}
        />
      </div>

      <div className="container max-w-6xl relative">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
          <div
            onMouseEnter={() => setHoveredCard("left")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <AudienceCard
              label="Propietarios"
              icon={<Home className="h-4 w-4" />}
              title="Alquilá tu propiedad con seguridad"
              highlight="con seguridad"
              support="Publicá tu propiedad gratis y recibí solo interesados verificados con garantía aprobada."
              bullets={propietariosBullets}
              ctaText="Publicar mi propiedad"
              ctaHref="/publicar"
              delay={150}
              visible={visible}
              side="left"
              dimmed={hoveredCard === "right"}
            />
          </div>
          <div
            onMouseEnter={() => setHoveredCard("right")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <AudienceCard
              label="Inmobiliarias"
              icon={<Building2 className="h-4 w-4" />}
              title="Digitalizá tus alquileres"
              highlight="alquileres"
              support="Recibí pedidos de visita de usuarios verificados y con garantía aprobada por Hoggax."
              bullets={inmobiliariasBullets}
              ctaText="Sumar mi inmobiliaria"
              ctaHref="/gestion-inmobiliaria"
              delay={300}
              visible={visible}
              accent
              side="right"
              dimmed={hoveredCard === "left"}
              disclaimer="*El contrato y firma electrónica tienen costo"
            />
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes audience-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -15px) scale(1.05); }
          66% { transform: translate(-10px, 10px) scale(0.97); }
        }
        @keyframes audience-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-15px, 20px) scale(1.03); }
          70% { transform: translate(10px, -10px) scale(0.98); }
        }
      `}</style>
    </section>
  );
};

export default DualCTA;
