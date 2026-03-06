"use client";

import { useRef, useState } from "react";
import { Search, ShieldCheck, Globe, Home } from "lucide-react";
import { useInView } from "@/hooks/useInView";

// Stagger offsets — cards 1&3 go up, cards 2&4 go down
const TOP_Y = -80;
const BOT_Y = 80;

// Wave path calibrated for lg:gap-16 layout (card centers at viewBox x ≈ 127, 442, 758, 1073).
// y=12 aligns with top-stagger card centers, y=172 with bottom-stagger card centers.
const WAVE_PATH =
  "M127,12 C285,12 285,172 442,172 C600,172 600,12 758,12 C916,12 916,172 1073,172";

// Progress semantics — SVG sits BEHIND white cards (z-0 < z-10).
// Fill under a card body is invisible; only the portion in the gap between cards shows.
const steps = [
  {
    id: "01",
    title: "Buscá tu propiedad",
    description:
      "Explorá opciones verificadas en nuestro catálogo inteligente de forma rápida.",
    icon: Search,
    pos: "top" as const,
    progress: 0.17,
  },
  {
    id: "02",
    title: "Verificate en mob",
    description:
      "Validáte una sola vez y aplicá a cualquier alquiler dentro de la plataforma.",
    icon: ShieldCheck,
    pos: "bottom" as const,
    progress: 0.50,
  },
  {
    id: "03",
    title: "Proceso online",
    description:
      "Reservá y gestioná tu contrato 100% digital con total seguridad jurídica.",
    icon: Globe,
    pos: "top" as const,
    progress: 0.83,
  },
  {
    id: "04",
    title: "Mudate ya",
    description:
      "¡Felicidades! Ya tenés las llaves de tu nuevo hogar en tiempo récord.",
    icon: Home,
    pos: "bottom" as const,
    progress: 1.0,
  },
];

const Timeline = () => {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeProgress, setActiveProgress] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  // Fired on the full pt-24/pb-28 container so hovering anywhere in the section
  // (above, on, or below the staggered cards) activates the right column.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    // Outside the grid's horizontal bounds → clear
    if (x < 0 || x > w) {
      if (activeCard !== null) { setActiveCard(null); setActiveProgress(0); }
      return;
    }
    const col = Math.min(3, Math.floor((x / w) * 4));
    if (col !== activeCard) {
      setActiveCard(col);
      setActiveProgress(steps[col].progress);
    }
  };

  const handleMouseLeave = () => {
    setActiveCard(null);
    setActiveProgress(0);
  };

  return (
    <section className="relative py-16 bg-[#f8faff] overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full -z-10 opacity-40"
        style={{ background: "#5170ff", filter: "blur(180px)" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* onMouseMove here so the full pt-24/pb-28 area (stagger space + cards) is reactive */}
        <div
          ref={ref}
          className="relative pt-24 pb-28"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >

          {/* Wave connector — z-0, rendered BEHIND cards (z-10) */}
          <div
            className="hidden lg:block absolute left-0 w-full pointer-events-none"
            style={{ top: "50%", transform: "translateY(-50%)", height: 200, zIndex: 0 }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1200 200"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d={WAVE_PATH}
                stroke="#e5eaf5"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d={WAVE_PATH}
                stroke="#5170ff"
                strokeWidth="10"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - activeProgress}
                style={{
                  transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </svg>
          </div>

          {/* 4-column card grid — z-10, above wave connector */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-16 relative z-10"
          >
            {steps.map((step, i) => {
              const Icon = step.icon;
              const targetY = step.pos === "top" ? TOP_Y : BOT_Y;
              const isActive = activeCard === i;

              return (
                <div
                  key={step.id}
                  className="cursor-default"
                  style={{
                    opacity: inView ? 1 : 0,
                    transition: `opacity 0.5s ease ${i * 0.15}s`,
                  }}
                >
                  <div
                    style={{
                      transform: inView
                        ? `translateY(${targetY}px)`
                        : `translateY(${targetY + 28}px)`,
                      transition: `transform 0.5s ease ${i * 0.15}s`,
                    }}
                  >
                    <div
                      className="bg-white border border-gray-100 p-7 rounded-[28px] w-full flex flex-col transition-shadow duration-300"
                      style={{
                        boxShadow: isActive
                          ? "0 16px 48px rgba(81,112,255,0.14)"
                          : "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                        style={{
                          background: isActive ? "#5170ff" : "rgba(81,112,255,0.07)",
                        }}
                      >
                        <Icon
                          size={20}
                          strokeWidth={1.75}
                          style={{
                            color: isActive ? "#ffffff" : "#5170ff",
                            transition: "color 0.3s",
                          }}
                        />
                      </div>

                      {/* Step number */}
                      <span
                        className="text-4xl font-black mb-2 font-display leading-none transition-colors duration-300"
                        style={{ color: isActive ? "rgba(81,112,255,0.4)" : "rgba(81,112,255,0.2)" }}
                      >
                        {step.id}
                      </span>

                      {/* Title */}
                      <h3
                        className="text-lg font-bold mb-3 leading-snug transition-colors duration-300"
                        style={{ color: isActive ? "#5170ff" : "#111827" }}
                      >
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
