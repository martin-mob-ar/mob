"use client";

import { useState } from "react";

const MOB_BLUE = "#5170FF";
const MOB_BLUE_FADED = "#5170FF50";

interface SectionData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  position: string;
  textAlign: string;
  titleAlign: string;
}

const sectionData: SectionData[] = [
  {
    id: "top-left",
    title: "Inmobiliarias verificadas",
    subtitle: "Tenemos acuerdos con inmobiliarias modernas.",
    description:
      "Todas las inmobiliarias en mob son validadas y vas a poder alquilar de manera simple.",
    position: "top-[18%] left-[5%]",
    textAlign: "text-left",
    titleAlign: "",
  },
  {
    id: "top-right",
    title: "Propietarios verificados",
    subtitle: "Verificamos identidad y veracidad de propietarios.",
    description:
      "Analizamos la identidad de cada persona y nos aseguramos de que no haya publicaciones falsas.",
    position: "top-[18%] right-[5%]",
    textAlign: "text-right",
    titleAlign: "ml-auto",
  },
  {
    id: "bottom-left",
    title: "Verificate",
    subtitle: "Mostrate como inquilino calificado",
    description:
      "Completás tu perfil una sola vez y validamos tu identidad e ingresos. Quedás preaprobado para aplicar a cualquier alquiler dentro de mob.",
    position: "top-[60%] left-[5%]",
    textAlign: "text-left",
    titleAlign: "",
  },
  {
    id: "bottom-right",
    title: "Proceso digital",
    subtitle:
      "Agendás visita, reservás y firmás el contrato de manera online",
    description:
      "Elegís horarios disponibles, reservás y firmás en mob. Todo el proceso simple y visible en un solo lugar.",
    position: "top-[60%] right-[5%]",
    textAlign: "text-right",
    titleAlign: "ml-auto",
  },
];

function renderWithMobHighlight(text: string) {
  const parts = text.split(/\b(mob)\b/g);
  return parts.map((part, i) =>
    part === "mob" ? (
      <span key={i} className="font-semibold font-ubuntu" style={{ color: MOB_BLUE }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

const quarters = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

const WhyMob = () => {
  const [activeSection, setActiveSection] = useState<string | null>("top-left");
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleMouseEnter = (sectionId: string) => {
    setHasInteracted(true);
    setActiveSection(sectionId);
  };

  const handleMouseLeave = () => {
    if (hasInteracted) {
      setActiveSection(null);
    }
  };

  const getQuarterOpacity = (quarterId: string) => {
    if (activeSection === null) return 1;
    return activeSection === quarterId ? 1 : 0.3;
  };

  const getQuarterTransform = (quarterId: string) => {
    if (activeSection !== quarterId) return "translate(0, 0) scale(1)";
    switch (quarterId) {
      case "top-left":
        return "translate(-20%, -20%) scale(1.1)";
      case "top-right":
        return "translate(20%, -20%) scale(1.1)";
      case "bottom-left":
        return "translate(-20%, 20%) scale(1.1)";
      case "bottom-right":
        return "translate(20%, 20%) scale(1.1)";
      default:
        return "translate(0, 0) scale(1)";
    }
  };

  const getQuarterFilter = (quarterId: string) => {
    if (activeSection === quarterId) {
      return `drop-shadow(0 0 12px ${MOB_BLUE}) drop-shadow(0 0 24px ${MOB_BLUE_FADED})`;
    }
    return "none";
  };

  const getQuarterPosition = (quarterId: string): React.CSSProperties => {
    switch (quarterId) {
      case "top-left":
        return { top: 0, left: 0 };
      case "top-right":
        return { top: 0, right: 0 };
      case "bottom-left":
        return { bottom: 0, left: 0 };
      case "bottom-right":
        return { bottom: 0, right: 0 };
      default:
        return { top: 0, left: 0 };
    }
  };

  const getQuarterBgPosition = (quarterId: string) => {
    switch (quarterId) {
      case "top-left":
        return "left top";
      case "top-right":
        return "right top";
      case "bottom-left":
        return "left bottom";
      case "bottom-right":
        return "right bottom";
      default:
        return "left top";
    }
  };

  const getLetterStyle = () => {
    if (activeSection === null) {
      return {
        color: MOB_BLUE,
        textShadow: `0 0 40px rgba(81, 112, 255, 0.3)`,
      };
    }
    return {
      color: MOB_BLUE_FADED,
      textShadow: "none",
    };
  };

  const gap = 4;

  return (
    <section
      id="why-mob"
      className="w-full overflow-hidden relative"
      style={{
        background:
          "radial-gradient(ellipse at center, #f9fafb 0%, #f3f5ff 50%, #edf0ff 100%)",
      }}
    >
      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col h-[65vh] max-h-[600px] relative">
        {/* Subtle animated background glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: activeSection
              ? `radial-gradient(ellipse at center, rgba(81, 112, 255, 0.06) 0%, transparent 60%)`
              : "none",
            opacity: activeSection ? 1 : 0,
          }}
        />

        {/* Title */}
        <div className="absolute top-[6%] left-0 right-0 flex justify-center z-10">
          <h2
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight transition-all duration-500"
            style={{ color: "#1a1a2e" }}
          >
            Propuesta{" "}
            <span
              className="font-ubuntu transition-all duration-500"
              style={{
                color: activeSection ? MOB_BLUE : "#1a1a2e",
                textShadow: activeSection
                  ? `0 0 30px rgba(81, 112, 255, 0.5)`
                  : "none",
              }}
            >
              mob
            </span>
          </h2>
        </div>

        {/* MOB Logo - O centered, letters around it */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div
            className="relative shrink-0 transition-all duration-500"
            style={{
              filter: activeSection
                ? "none"
                : `drop-shadow(0 0 30px rgba(81, 112, 255, 0.2))`,
              width: "clamp(100px, 12vw, 180px)",
              height: "clamp(100px, 12vw, 180px)",
            }}
          >
            {/* M letter */}
            <span
              className="absolute select-none transition-all duration-500 ease-out leading-none font-bold font-ubuntu"
              style={{
                fontSize: "clamp(8rem, 15vw, 14rem)",
                ...getLetterStyle(),
                right: "100%",
                bottom: "clamp(-8px, -1vw, -14px)",
                transform: activeSection
                  ? "translateX(-15%) scale(0.95)"
                  : "translateX(0) scale(1)",
              }}
            >
              m
            </span>

            {/* B letter */}
            <span
              className="absolute select-none transition-all duration-500 ease-out leading-none font-bold font-ubuntu"
              style={{
                fontSize: "clamp(8rem, 15vw, 14rem)",
                ...getLetterStyle(),
                left: "100%",
                top: "50%",
                transform: activeSection
                  ? "translateY(-50%) translateX(15%) scale(0.95)"
                  : "translateY(-50%) translateX(0) scale(1)",
              }}
            >
              b
            </span>

            {/* O made of 4 quarters */}
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 rounded-full transition-all duration-500 -z-10"
                style={{
                  transform: "scale(1.5)",
                  background: activeSection
                    ? `radial-gradient(circle, rgba(81, 112, 255, 0.15) 0%, transparent 70%)`
                    : `radial-gradient(circle, rgba(81, 112, 255, 0.08) 0%, transparent 70%)`,
                }}
              />

              {quarters.map((quarterId) => (
                <div
                  key={quarterId}
                  className="absolute cursor-pointer transition-all duration-300 ease-out hover:z-10"
                  style={{
                    ...getQuarterPosition(quarterId),
                    width: `calc(50% - ${gap}px)`,
                    height: `calc(50% - ${gap}px)`,
                    transform: getQuarterTransform(quarterId),
                    filter: getQuarterFilter(quarterId),
                    opacity: getQuarterOpacity(quarterId),
                    backgroundImage: `url(/assets/isotipo-mob-original.png)`,
                    backgroundSize: `calc(200% + ${gap * 2}px)`,
                    backgroundPosition: getQuarterBgPosition(quarterId),
                    backgroundRepeat: "no-repeat",
                  }}
                  onMouseEnter={() => handleMouseEnter(quarterId)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text blocks at corners */}
        {sectionData.map((section) => {
          const isActive = activeSection === section.id;
          const isRight = section.id.includes("right");

          return (
            <div
              key={section.id}
              className={`absolute max-w-xs px-6 xl:px-12 z-20 transition-all duration-500 ease-out cursor-pointer ${section.position} ${section.textAlign}`}
              style={{
                transform: isActive ? "scale(1.05)" : "scale(1)",
                transformOrigin: isRight ? "top right" : "top left",
              }}
              onMouseEnter={() => handleMouseEnter(section.id)}
              onMouseLeave={handleMouseLeave}
            >
              <h3
                className={`font-display font-bold mb-1 tracking-tight transition-all duration-500 ${section.titleAlign}`}
                style={{
                  fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                  color: isActive ? MOB_BLUE : "#64748b",
                  borderBottom: isActive
                    ? `3px solid ${MOB_BLUE}`
                    : "2px solid #94a3b8",
                  paddingBottom: "0.25rem",
                  display: "inline-block",
                }}
              >
                {section.title}
              </h3>
              <p
                className="font-medium mt-2 transition-all duration-500"
                style={{
                  color: isActive ? "#374151" : "#64748b",
                  fontSize: "clamp(0.8rem, 1.3vw, 0.95rem)",
                }}
              >
                {section.subtitle}
              </p>
              <p
                className="leading-relaxed mt-2 transition-all duration-500"
                style={{
                  color: isActive ? "#374151" : "#94a3b8",
                  fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)",
                }}
              >
                {renderWithMobHighlight(section.description)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:flex lg:hidden flex-col items-center py-16 px-4">
        <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">
          Propuesta <span className="font-ubuntu text-primary">mob</span>
        </h2>

        {/* Isotipo with m and b */}
        <div className="flex items-center justify-center mb-12">
          <div
            className="relative shrink-0"
            style={{ width: "140px", height: "140px" }}
          >
            <span
              className="absolute select-none leading-none font-bold font-ubuntu text-primary"
              style={{ fontSize: "6rem", right: "100%", bottom: "-4px" }}
            >
              m
            </span>
            <span
              className="absolute select-none leading-none font-bold font-ubuntu text-primary"
              style={{ fontSize: "6rem", left: "100%", top: "50%", transform: "translateY(-50%)" }}
            >
              b
            </span>
            <div className="relative w-full h-full">
              {quarters.map((quarterId) => (
                <div
                  key={quarterId}
                  className="absolute"
                  style={{
                    ...getQuarterPosition(quarterId),
                    width: `calc(50% - ${gap}px)`,
                    height: `calc(50% - ${gap}px)`,
                    backgroundImage: `url(/assets/isotipo-mob-original.png)`,
                    backgroundSize: `calc(200% + ${gap * 2}px)`,
                    backgroundPosition: getQuarterBgPosition(quarterId),
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
          {sectionData.map((section) => (
            <div key={section.id} className="text-center">
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                {section.title}
              </h3>
              <p className="text-foreground/80 text-sm font-medium mb-2">
                {section.subtitle}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {renderWithMobHighlight(section.description)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden py-10 px-4">
        <h2 className="font-display text-xl font-bold text-foreground text-center mb-8">
          Propuesta <span className="font-ubuntu text-primary">mob</span>
        </h2>

        {/* Isotipo centered */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative" style={{ width: "90px", height: "90px" }}>
            <span
              className="absolute select-none leading-none font-bold font-ubuntu text-primary"
              style={{ fontSize: "4rem", right: "100%", bottom: "-2px" }}
            >
              m
            </span>
            <span
              className="absolute select-none leading-none font-bold font-ubuntu text-primary"
              style={{ fontSize: "4rem", left: "100%", top: "50%", transform: "translateY(-50%)" }}
            >
              b
            </span>
            <div className="relative w-full h-full">
              {quarters.map((quarterId) => (
                <div
                  key={quarterId}
                  className="absolute"
                  style={{
                    ...getQuarterPosition(quarterId),
                    width: `calc(50% - ${gap}px)`,
                    height: `calc(50% - ${gap}px)`,
                    backgroundImage: `url(/assets/isotipo-mob-original.png)`,
                    backgroundSize: `calc(200% + ${gap * 2}px)`,
                    backgroundPosition: getQuarterBgPosition(quarterId),
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Vertical concept cards */}
        <div className="flex flex-col gap-4 px-2">
          {sectionData.map((section) => (
            <div
              key={section.id}
              className="text-left p-4 rounded-xl border bg-background/80 backdrop-blur-sm border-border"
            >
              <h3 className="font-display font-bold text-lg mb-1 text-primary">
                {section.title}
              </h3>
              <p className="text-foreground/80 text-sm font-medium mb-2">
                {section.subtitle}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {renderWithMobHighlight(section.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyMob;
