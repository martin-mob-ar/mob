import { useState, useEffect, useRef } from "react";

type Section = "buscar" | "certificate" | "alquilar" | "sinaval" | null;

const concepts = {
  buscar: {
    title: "Buscar",
    subtitle: "Propiedades de propietarios e inmobiliarias verificadas",
    description: "Encontrá alquileres publicados por inmobiliarias y propietarios verificados. Con <span class=\"font-ubuntu\">mob</span>, los procesos son ágiles y no perdés tiempo en consultas que no llegan a nada.",
  },
  certificate: {
    title: "Certificate",
    subtitle: "Verificá tu perfil una sola vez y accedé a procesos más ágiles.",
    description: "Una vez verificado por <span class=\"font-ubuntu\">mob</span>, propietarios e inmobiliarias ya confían en tu perfil, reduciendo demoras y mejorando la velocidad para alquilar.",
  },
  sinaval: {
    title: "Sin aval",
    subtitle: "Menos requisitos para alquilar.",
    description: "Alquilá sin aval tradicional gracias a nuestra integración con Hoggax. Accedé a una garantía de alquiler con 50% de descuento, menos requisitos y un costo significativamente menor.",
  },
  alquilar: {
    title: "Alquilar",
    subtitle: "Contrato digital, proceso simple.",
    description: "Firmá tu contrato de alquiler de forma 100% digital, con firma electrónica y validez legal. Menos pasos y un proceso diseñado para avanzar de manera rápida y ordenada.",
  },
};

const WhyMob = () => {
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTextOpacity = (section: Section) => {
    if (activeSection === null) return "opacity-100";
    return activeSection === section ? "opacity-100" : "opacity-40";
  };

  const getTitleColor = (section: Section) => {
    return activeSection === section ? "text-primary" : "text-foreground";
  };

  const getQuadrantStyles = (section: Section) => {
    if (activeSection === section) {
      return "fill-primary scale-[1.04] brightness-110";
    }
    if (activeSection === null) {
      return "fill-primary/85 hover:fill-primary hover:scale-[1.02]";
    }
    return "fill-primary/40";
  };

  return (
    <section id="why-mob" ref={sectionRef} className="py-6 md:py-9 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Title */}
        <h2 
          className={`font-display text-xl md:text-3xl lg:text-4xl font-bold text-foreground text-center mb-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Propuesta <span className="font-ubuntu text-primary">mob</span>
        </h2>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="relative min-h-[500px]">
            {/* Top Row */}
            <div className="absolute top-8 left-0 right-0 flex justify-between items-start px-16">
              {/* Buscar - Top Left */}
              <div 
                className={`max-w-xs text-left transition-all duration-500 cursor-pointer ${getTextOpacity("buscar")} ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                }`}
                style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
                onMouseEnter={() => setActiveSection("buscar")}
                onMouseLeave={() => setActiveSection(null)}
              >
                <h3 className={`font-display font-bold text-xl md:text-2xl mb-1 transition-colors duration-300 relative inline-block ${getTitleColor("buscar")}`}>
                  {concepts.buscar.title}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${activeSection === "buscar" ? "w-full" : "w-0"}`} />
                </h3>
                <p className={`text-foreground/80 text-sm font-medium mb-2 ${activeSection === "buscar" ? "opacity-100" : "opacity-70"}`}>
                  {concepts.buscar.subtitle}
                </p>
                <p className={`text-muted-foreground text-sm leading-relaxed transition-opacity duration-300 ${activeSection === "buscar" ? "opacity-100" : "opacity-80"}`}>
                  {concepts.buscar.description}
                </p>
              </div>

              {/* Certificate - Top Right */}
              <div 
                className={`max-w-xs text-right transition-all duration-500 cursor-pointer ${getTextOpacity("certificate")} ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                }`}
                style={{ transitionDelay: isVisible ? "300ms" : "0ms" }}
                onMouseEnter={() => setActiveSection("certificate")}
                onMouseLeave={() => setActiveSection(null)}
              >
                <h3 className={`font-display font-bold text-xl md:text-2xl mb-1 transition-colors duration-300 relative inline-block ${getTitleColor("certificate")}`}>
                  {concepts.certificate.title}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${activeSection === "certificate" ? "w-full" : "w-0"}`} />
                </h3>
                <p className={`text-foreground/80 text-sm font-medium mb-2 ${activeSection === "certificate" ? "opacity-100" : "opacity-70"}`}>
                  {concepts.certificate.subtitle}
                </p>
                <p className={`text-muted-foreground text-sm leading-relaxed transition-opacity duration-300 ${activeSection === "certificate" ? "opacity-100" : "opacity-80"}`}>
                  {concepts.certificate.description}
                </p>
              </div>
            </div>

            {/* Center Isotipo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div 
                className={`transition-all duration-700 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                }`}
                style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}
              >
                <svg 
                  width="280" 
                  height="280" 
                  viewBox="0 0 100 100" 
                  className={`transition-transform duration-[3000ms] ease-in-out ${activeSection === null ? "animate-pulse-subtle" : ""}`}
                  style={{ animationDuration: "4s" }}
                >
                  {/* Top-Left Quadrant - Buscar */}
                  <path
                    d="M 48 5 A 45 45 0 0 0 5 48 L 28 48 A 22 22 0 0 1 48 28 Z"
                    className={`transition-all duration-300 cursor-pointer origin-center ${getQuadrantStyles("buscar")}`}
                    onMouseEnter={() => setActiveSection("buscar")}
                    onMouseLeave={() => setActiveSection(null)}
                  />
                  
                  {/* Top-Right Quadrant - Certificate */}
                  <path
                    d="M 52 5 A 45 45 0 0 1 95 48 L 72 48 A 22 22 0 0 0 52 28 Z"
                    className={`transition-all duration-300 cursor-pointer origin-center ${getQuadrantStyles("certificate")}`}
                    onMouseEnter={() => setActiveSection("certificate")}
                    onMouseLeave={() => setActiveSection(null)}
                  />
                  
                  {/* Bottom-Left Quadrant - Sin aval */}
                  <path
                    d="M 5 52 A 45 45 0 0 0 48 95 L 48 72 A 22 22 0 0 1 28 52 Z"
                    className={`transition-all duration-300 cursor-pointer origin-center ${getQuadrantStyles("sinaval")}`}
                    onMouseEnter={() => setActiveSection("sinaval")}
                    onMouseLeave={() => setActiveSection(null)}
                  />
                  
                  {/* Bottom-Right Quadrant - Alquilar */}
                  <path
                    d="M 95 52 A 45 45 0 0 1 52 95 L 52 72 A 22 22 0 0 0 72 52 Z"
                    className={`transition-all duration-300 cursor-pointer origin-center ${getQuadrantStyles("alquilar")}`}
                    onMouseEnter={() => setActiveSection("alquilar")}
                    onMouseLeave={() => setActiveSection(null)}
                  />
                </svg>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-between items-end px-16">
              {/* Sin aval - Bottom Left */}
              <div 
                className={`max-w-xs text-left transition-all duration-500 cursor-pointer ${getTextOpacity("sinaval")} ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                }`}
                style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
                onMouseEnter={() => setActiveSection("sinaval")}
                onMouseLeave={() => setActiveSection(null)}
              >
                <h3 className={`font-display font-bold text-xl md:text-2xl mb-1 transition-colors duration-300 relative inline-block ${getTitleColor("sinaval")}`}>
                  {concepts.sinaval.title}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${activeSection === "sinaval" ? "w-full" : "w-0"}`} />
                </h3>
                <p className={`text-foreground/80 text-sm font-medium mb-2 ${activeSection === "sinaval" ? "opacity-100" : "opacity-70"}`}>
                  {concepts.sinaval.subtitle}
                </p>
                <p className={`text-muted-foreground text-sm leading-relaxed transition-opacity duration-300 ${activeSection === "sinaval" ? "opacity-100" : "opacity-80"}`}>
                  {concepts.sinaval.description}
                </p>
              </div>

              {/* Alquilar - Bottom Right */}
              <div 
                className={`max-w-xs text-right transition-all duration-500 cursor-pointer ${getTextOpacity("alquilar")} ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                }`}
                style={{ transitionDelay: isVisible ? "500ms" : "0ms" }}
                onMouseEnter={() => setActiveSection("alquilar")}
                onMouseLeave={() => setActiveSection(null)}
              >
                <h3 className={`font-display font-bold text-xl md:text-2xl mb-1 transition-colors duration-300 relative inline-block ${getTitleColor("alquilar")}`}>
                  {concepts.alquilar.title}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${activeSection === "alquilar" ? "w-full" : "w-0"}`} />
                </h3>
                <p className={`text-foreground/80 text-sm font-medium mb-2 ${activeSection === "alquilar" ? "opacity-100" : "opacity-70"}`}>
                  {concepts.alquilar.subtitle}
                </p>
                <p className={`text-muted-foreground text-sm leading-relaxed transition-opacity duration-300 ${activeSection === "alquilar" ? "opacity-100" : "opacity-80"}`}>
                  {concepts.alquilar.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden md:block lg:hidden">
          <div className="flex flex-col items-center gap-12">
            {/* Isotipo */}
            <div 
              className={`transition-all duration-700 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            >
              <svg width="200" height="200" viewBox="0 0 100 100">
                <path d="M 48 5 A 45 45 0 0 0 5 48 L 28 48 A 22 22 0 0 1 48 28 Z" className="fill-primary/85" />
                <path d="M 52 5 A 45 45 0 0 1 95 48 L 72 48 A 22 22 0 0 0 52 28 Z" className="fill-primary/85" />
                <path d="M 5 52 A 45 45 0 0 0 48 95 L 48 72 A 22 22 0 0 1 28 52 Z" className="fill-primary/85" />
                <path d="M 95 52 A 45 45 0 0 1 52 95 L 52 72 A 22 22 0 0 0 72 52 Z" className="fill-primary/85" />
              </svg>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-8 max-w-3xl">
              {(["buscar", "certificate", "sinaval", "alquilar"] as const).map((key, index) => (
                <div 
                  key={key}
                  className={`text-center transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: isVisible ? `${200 + index * 100}ms` : "0ms" }}
                >
                  <h3 className="font-display font-bold text-xl text-foreground mb-1">
                    {concepts[key].title}
                  </h3>
                  <p className="text-foreground/80 text-sm font-medium mb-2">
                    {concepts[key].subtitle}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {concepts[key].description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout - Optimized for tap interaction */}
        <div className="md:hidden">
          {/* Isotipo - Simplified and centered */}
          <div 
            className={`flex items-center justify-center mb-8 transition-all duration-700 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          >
            <svg width="120" height="120" viewBox="0 0 100 100">
              <path d="M 48 5 A 45 45 0 0 0 5 48 L 28 48 A 22 22 0 0 1 48 28 Z" className="fill-primary/85" />
              <path d="M 52 5 A 45 45 0 0 1 95 48 L 72 48 A 22 22 0 0 0 52 28 Z" className="fill-primary/85" />
              <path d="M 5 52 A 45 45 0 0 0 48 95 L 48 72 A 22 22 0 0 1 28 52 Z" className="fill-primary/85" />
              <path d="M 95 52 A 45 45 0 0 1 52 95 L 52 72 A 22 22 0 0 0 72 52 Z" className="fill-primary/85" />
            </svg>
          </div>

          {/* Mobile Concepts - Vertical blocks with full text */}
          <div className="flex flex-col gap-4 px-2">
            {(["buscar", "certificate", "sinaval", "alquilar"] as const).map((key, index) => (
              <div 
                key={key} 
                className={`text-left p-4 rounded-xl border bg-secondary/30 border-border transition-all duration-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: isVisible ? `${150 + index * 80}ms` : "0ms" }}
              >
                <h3 className="font-display font-bold text-lg mb-1 text-primary">
                  {concepts[key].title}
                </h3>
                <p className="text-foreground/80 text-sm font-medium mb-2">
                  {concepts[key].subtitle}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {concepts[key].description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.95; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default WhyMob;
