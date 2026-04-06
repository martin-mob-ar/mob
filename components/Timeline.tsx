"use client";

import { useRef, useState, useEffect } from "react";
import { Search, ShieldCheck, Globe, Home } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const TOP_Y = -80;
const BOT_Y = 80;

const WAVE_PATH =
  "M127,12 C285,12 285,172 442,172 C600,172 600,12 758,12 C916,12 916,172 1073,172";

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
    progress: 0.5,
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

/* ------------------------------------------------------------------ */
/*  Easing tokens                                                     */
/* ------------------------------------------------------------------ */
const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_OUT_BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const Timeline = () => {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Desktop interaction state */
  const [activeProgress, setActiveProgress] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  /* Breakpoint flags */
  const [isLg, setIsLg] = useState(false);

  /* Mobile scroll-trigger state */
  const [visibleCards, setVisibleCards] = useState<boolean[]>(
    () => new Array(steps.length).fill(false)
  );

  /* Accessibility */
  const [reducedMotion, setReducedMotion] = useState(false);

  /* Derived: highest card index that has scrolled into view */
  const mobileActiveIdx = (() => {
    for (let i = visibleCards.length - 1; i >= 0; i--) {
      if (visibleCards[i]) return i;
    }
    return -1;
  })();
  const mobileLineProgress =
    mobileActiveIdx >= 0 ? (mobileActiveIdx + 1) / steps.length : 0;

  /* ---- Effects --------------------------------------------------- */

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLg(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  /* Per-card IntersectionObserver — mobile / tablet only */
  useEffect(() => {
    if (isLg) return;

    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setVisibleCards((prev) => {
            if (prev[i]) return prev;
            const next = [...prev];
            next[i] = true;
            return next;
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [isLg]);

  /* ---- Desktop mouse tracking (unchanged) ------------------------ */

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current || !isLg) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    if (x < 0 || x > w) {
      if (activeCard !== null) {
        setActiveCard(null);
        setActiveProgress(0);
      }
      return;
    }
    const col = Math.min(3, Math.floor((x / w) * 4));
    if (col !== activeCard) {
      setActiveCard(col);
      setActiveProgress(steps[col].progress);
    }
  };

  const handleMouseLeave = () => {
    if (!isLg) return;
    setActiveCard(null);
    setActiveProgress(0);
  };

  /* ---- Helpers --------------------------------------------------- */

  /** Transition string — collapses to instant when reduced-motion is on */
  const t = (value: string) => (reducedMotion ? "none" : value);

  return (
    <section className="relative py-8 lg:py-16 bg-[#f8faff] overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full -z-10 opacity-40"
        style={{ background: "#5170ff", filter: "blur(180px)" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className="relative pt-2 pb-2 lg:pt-24 lg:pb-28"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* ======= Desktop wave connector (lg+) ======= */}
          <div
            className="hidden lg:block absolute left-0 w-full pointer-events-none"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              height: 200,
              zIndex: 0,
            }}
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
                  transition: `stroke-dashoffset 1.2s ${EASE_OUT_EXPO}`,
                }}
              />
            </svg>
          </div>

          {/* ======= Mobile vertical progress line (<md) ======= */}
          <div
            className="md:hidden absolute pointer-events-none z-0"
            style={{ left: 20, top: 16, bottom: 16, width: 2 }}
          >
            {/* Track */}
            <div className="absolute inset-0 rounded-full bg-[#e5eaf5]" />
            {/* Animated fill */}
            <div
              className="absolute top-0 left-0 w-full rounded-full bg-[#5170ff]"
              style={{
                height: `${mobileLineProgress * 100}%`,
                transition: t(`height 0.8s ${EASE_OUT_EXPO}`),
              }}
            />
          </div>

          {/* ======= Card grid ======= */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-16 relative z-10"
          >
            {steps.map((step, i) => {
              const Icon = step.icon;
              const targetY = isLg
                ? step.pos === "top"
                  ? TOP_Y
                  : BOT_Y
                : 0;

              /* ---- Visibility / activation logic ---- */
              const isVisible = isLg ? inView : visibleCards[i];
              const isMobileReached = !isLg && visibleCards[i];
              const isMobileCurrent = !isLg && mobileActiveIdx === i;
              const isDesktopActive = isLg && activeCard === i;
              const isHighlighted = isMobileCurrent || isDesktopActive;

              /* Mobile: alternate slide direction */
              const slideX = i % 2 === 0 ? -30 : 30;

              return (
                <div
                  key={step.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="cursor-default relative pl-12 md:pl-0"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translate3d(0,0,0)"
                      : isLg
                        ? "none"
                        : `translate3d(${slideX}px, 16px, 0)`,
                    transition: t(
                      isLg
                        ? `opacity 0.5s ease ${i * 0.15}s`
                        : `opacity 0.6s ${EASE_OUT_EXPO}, transform 0.7s ${EASE_OUT_EXPO}`
                    ),
                  }}
                >
                  {/* ---- Mobile timeline dot ---- */}
                  <div
                    className="md:hidden absolute z-10"
                    style={{
                      left: -1,
                      top: 26,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `3px solid ${isMobileReached ? "#5170ff" : "#e5eaf5"}`,
                      background: isMobileReached ? "#5170ff" : "#fff",
                      transform: isVisible ? "scale(1)" : "scale(0)",
                      transition: t(
                        `transform 0.4s ${EASE_OUT_BACK} 0.15s, border-color 0.3s, background-color 0.3s`
                      ),
                    }}
                  >
                    {isMobileReached && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#fff",
                          margin: "auto",
                          marginTop: 3,
                        }}
                      />
                    )}
                  </div>

                  {/* ---- Card body (desktop stagger offset applied here) ---- */}
                  <div
                    style={{
                      transform: inView
                        ? `translateY(${targetY}px)`
                        : `translateY(${targetY + 28}px)`,
                      transition: t(
                        `transform 0.5s ease ${i * 0.15}s`
                      ),
                    }}
                  >
                    <div
                      className="bg-white border border-gray-100 p-7 rounded-xl w-full flex flex-col"
                      style={{
                        boxShadow: isHighlighted
                          ? "0 16px 48px rgba(81,112,255,0.14)"
                          : "0 1px 3px rgba(0,0,0,0.06)",
                        transition: t("box-shadow 0.3s"),
                      }}
                    >
                      {/* Icon container — bounces in on mobile */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                        style={{
                          background: isHighlighted
                            ? "#5170ff"
                            : "rgba(81,112,255,0.07)",
                          transform: isVisible
                            ? "scale(1) rotate(0deg)"
                            : "scale(0.4) rotate(-16deg)",
                          transition: t(
                            `background-color 0.3s, transform 0.55s ${EASE_OUT_BACK} 0.12s`
                          ),
                        }}
                      >
                        <Icon
                          size={20}
                          strokeWidth={1.75}
                          style={{
                            color: isHighlighted ? "#ffffff" : "#5170ff",
                            transition: t("color 0.3s"),
                          }}
                        />
                      </div>

                      {/* Step number — slides in from left */}
                      <span
                        className="text-4xl font-black mb-2 font-display leading-none"
                        style={{
                          color: isHighlighted
                            ? "#5170ff"
                            : "rgba(81,112,255,0.2)",
                          transform: isVisible
                            ? "translateX(0)"
                            : "translateX(-14px)",
                          opacity: isVisible ? 1 : 0,
                          transition: t(
                            `color 0.3s, transform 0.5s ${EASE_OUT_EXPO} 0.08s, opacity 0.4s 0.08s`
                          ),
                        }}
                      >
                        {step.id}
                      </span>

                      {/* Title — color transition on activation */}
                      <h3
                        className="text-lg font-bold mb-3 leading-snug"
                        style={{
                          color: isHighlighted ? "#5170ff" : "#111827",
                          transition: t("color 0.3s"),
                        }}
                      >
                        {step.title}
                      </h3>

                      {/* Description — fades up last */}
                      <p
                        className="text-gray-600 text-sm leading-relaxed"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible
                            ? "translateY(0)"
                            : "translateY(10px)",
                          transition: t(
                            `opacity 0.5s 0.2s, transform 0.5s ${EASE_OUT_EXPO} 0.2s`
                          ),
                        }}
                      >
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
