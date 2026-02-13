"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Lock, 
  CheckCircle2, 
  X, 
  ArrowRight,
  ArrowLeft,
  Megaphone,
  UserCheck,
  Calendar,
  FileText,
  Shield,
  Building2,
  Eye,
  LayoutDashboard,
  FileSignature,
  Headphones,
  Home,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  MessageSquare,
  CalendarX,
  ClipboardList,
  UserX,
  Clock,
  Network
} from "lucide-react";
const isotipo = "/assets/isotipo-mob-original.png";
const mobLogo = "/assets/mob-logo-new.png";

const ACCESS_CODE = "1234";
const TOTAL_SLIDES = 13;

const PresentacionComercial3 = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAuthenticated) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated, nextSlide, prevSlide]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Only trigger if horizontal swipe is greater than vertical (to avoid conflict with scrolling)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    };

    if (isAuthenticated) {
      document.addEventListener("touchstart", handleTouchStart, { passive: true });
      document.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isAuthenticated, nextSlide, prevSlide]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src={isotipo} alt="MOB" className="h-12 mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Presentación Comercial</h1>
            <p className="text-sm text-muted-foreground">Ingresá el código de acceso</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Código" 
                value={code} 
                onChange={(e) => { setCode(e.target.value); setError(false); }} 
                className={`pl-10 ${error ? 'border-destructive' : ''}`} 
                autoFocus 
              />
            </div>
            {error && <p className="text-sm text-destructive">Código incorrecto</p>}
            <Button type="submit" className="w-full">Ingresar</Button>
          </form>
        </div>
      </div>
    );
  }

  const slides = [
    // Slide 1 - Hero
    <div key="hero" className="h-full flex flex-col items-center justify-center text-center px-6 lg:px-12">
      <img src={mobLogo} alt="MOB" className="h-10 lg:h-16 mb-6 lg:mb-8" />
      <h1 className="text-3xl lg:text-5xl xl:text-7xl font-bold text-foreground mb-4 lg:mb-6 tracking-tight">
        Digitalizá tus alquileres
      </h1>
      <h2 className="text-xl lg:text-2xl xl:text-3xl text-primary font-semibold mb-6 lg:mb-8">
        Delegá la operación. Conservá el control.
      </h2>
      <p className="text-base lg:text-xl text-muted-foreground max-w-3xl">
        Promoción · Verificación · Visitas · Contratos · Administración
      </p>
    </div>,

    // Slide 2 - El problema
    <div key="problema" className="h-full flex flex-col items-center justify-center px-4 lg:px-12 py-8 lg:py-0">
      <h2 className="text-2xl lg:text-4xl xl:text-6xl font-bold text-foreground mb-6 lg:mb-12 text-center">
        Los problemas de<br />manejar alquileres
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5 max-w-5xl w-full">
        <div className="bg-white border-2 border-primary/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center shadow-lg shadow-primary/10">
          <MessageSquare className="h-5 w-5 lg:h-7 lg:w-7 text-primary mx-auto mb-2 lg:mb-3" />
          <p className="font-semibold text-primary text-sm lg:text-lg">Consultas sin filtrar</p>
        </div>
        <div className="bg-white border-2 border-primary/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center shadow-lg shadow-primary/10">
          <CalendarX className="h-5 w-5 lg:h-7 lg:w-7 text-primary mx-auto mb-2 lg:mb-3" />
          <p className="font-semibold text-primary text-sm lg:text-lg">Visitas improductivas</p>
        </div>
        <div className="bg-white border-2 border-primary/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center shadow-lg shadow-primary/10">
          <ClipboardList className="h-5 w-5 lg:h-7 lg:w-7 text-primary mx-auto mb-2 lg:mb-3" />
          <p className="font-semibold text-primary text-sm lg:text-lg">Procedimientos manuales</p>
        </div>
        <div className="bg-white border-2 border-primary/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center shadow-lg shadow-primary/10">
          <UserX className="h-5 w-5 lg:h-7 lg:w-7 text-primary mx-auto mb-2 lg:mb-3" />
          <p className="font-semibold text-primary text-sm lg:text-lg">Interesados sin respaldo</p>
        </div>
        <div className="bg-white border-2 border-primary/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center shadow-lg shadow-primary/10">
          <Clock className="h-5 w-5 lg:h-7 lg:w-7 text-primary mx-auto mb-2 lg:mb-3" />
          <p className="font-semibold text-primary text-sm lg:text-lg">Procesos lentos</p>
        </div>
        <div className="bg-white border-2 border-primary/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center shadow-lg shadow-primary/10">
          <Network className="h-5 w-5 lg:h-7 lg:w-7 text-primary mx-auto mb-2 lg:mb-3" />
          <p className="font-semibold text-primary text-sm lg:text-lg">Administración dispersa</p>
        </div>
      </div>
      <p className="text-sm lg:text-base text-muted-foreground mt-6 lg:mt-10 text-center">
        Mucho esfuerzo operativo, poco foco en cerrar.
      </p>
    </div>,

    // Slide 3 - Dolor
    <div key="dolor" className="h-full flex flex-col items-center justify-center text-center px-6 lg:px-12">
      <h2 className="text-2xl lg:text-4xl xl:text-6xl font-bold text-foreground mb-6 lg:mb-8">
        Mucho foco operativo
      </h2>
      <p className="text-xl lg:text-3xl xl:text-4xl font-bold text-primary">
        te saca el foco en lo importante.
      </p>
    </div>,

    // Slide 4 - Modelo tradicional
    <div key="modelo" className="h-full flex flex-col items-center justify-center px-4 lg:px-12">
      <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 lg:mb-8">
        Modelo tradicional de alquiler
      </p>
      <div className="bg-muted/40 border border-border rounded-xl p-4 lg:p-8 mb-6 lg:mb-8 max-w-full">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 text-sm lg:text-lg">
          {['Publicar', 'Responder', 'Filtrar', 'Coordinar', 'Verificar', 'Contratar', 'Administrar'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 lg:gap-3">
              <span className="bg-background border border-border px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium text-foreground text-xs lg:text-base whitespace-nowrap w-full lg:w-auto text-center min-w-[140px] lg:min-w-0">{step}</span>
              {i < arr.length - 1 && <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0 hidden lg:block" />}
            </div>
          ))}
        </div>
      </div>
      <p className="text-base lg:text-xl text-muted-foreground text-center">
        Tu equipo no está enfocado en generar <span className="font-semibold text-foreground">relaciones</span>
      </p>
    </div>,

    // Slide 5 - Consecuencias
    <div key="consecuencias" className="h-full flex flex-col items-center justify-center px-4 lg:px-12">
      <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-8 lg:mb-12 text-center">
        Consecuencias del modelo actual
      </h2>
      <div className="flex flex-col lg:flex-row lg:flex-wrap justify-center gap-3 lg:gap-4 max-w-4xl w-full lg:w-auto">
        {['Saturación operativa', 'Errores humanos', 'Pérdida de oportunidades', 'Equipos quemados', 'Crecimiento limitado'].map((text) => (
          <div key={text} className="bg-foreground/5 border border-border rounded-xl px-4 py-3 lg:px-6 lg:py-5 text-center w-full lg:w-auto">
            <p className="font-semibold text-foreground text-sm lg:text-base">{text}</p>
          </div>
        ))}
      </div>
    </div>,

    // Slide 6 - Insight
    <div key="insight" className="h-full flex flex-col items-center justify-center text-center px-4 lg:px-12">
      <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl lg:rounded-3xl p-8 lg:p-16 max-w-3xl">
        <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 lg:mb-6">
          Separar operación de decisión
        </h2>
        <p className="text-lg lg:text-2xl font-semibold text-primary mb-3 lg:mb-4">
          Ejecutar no es lo mismo que decidir.
        </p>
        <p className="text-base lg:text-xl text-muted-foreground">
          La operación puede delegarse sin perder control.
        </p>
      </div>
    </div>,

    // Slide 7 - MOB es infraestructura
    <div key="mob" className="h-full flex flex-col items-center justify-center px-4 lg:px-12 py-8 lg:py-0">
      <h2 className="text-xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-8 lg:mb-12 text-center">
        <span className="font-ubuntu">mob</span> es infraestructura operativa<br />para alquileres
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-4xl w-full">
        <div className="bg-primary/5 border border-primary/30 rounded-xl lg:rounded-2xl p-5 lg:p-8">
          <p className="text-xs lg:text-sm font-semibold text-primary mb-3 lg:mb-4 uppercase tracking-wider"><span className="font-ubuntu">mob</span> ejecuta</p>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {['Publicación', 'Interesados', 'Verificación', 'Agenda de visitas', 'Gestión de reservas', 'Contratos', 'Administración'].map((item) => (
              <span key={item} className="bg-background border border-primary/20 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium text-xs lg:text-base">{item}</span>
            ))}
          </div>
        </div>
        <div className="bg-muted/40 border border-border rounded-xl lg:rounded-2xl p-5 lg:p-8">
          <p className="text-xs lg:text-sm font-semibold text-foreground mb-3 lg:mb-4 uppercase tracking-wider">Inmobiliaria</p>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {['Visitas', 'Supervisión', 'Relación con el cliente'].map((item) => (
              <span key={item} className="bg-background border px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium text-xs lg:text-base">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>,

    // Slide 8 - Verificación Hoggax
    <div key="hoggax" className="h-full flex flex-col items-center justify-center px-4 lg:px-12 py-8 lg:py-0 bg-gradient-to-b from-background to-primary/5">
      <h2 className="text-xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-8 lg:mb-12 text-center">
        Verificación de inquilinos por Hoggax
      </h2>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-5xl w-full">
        {/* Left card - What Hoggax verifies */}
        <div className="bg-background border border-border rounded-xl lg:rounded-2xl p-5 lg:p-8 flex-1">
          <h3 className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 lg:mb-6">Qué verifica Hoggax</h3>
          <ul className="space-y-3 lg:space-y-4">
            {['Identidad', 'Antecedentes', 'Situación financiera', 'Capacidad de pago'].map((item) => (
              <li key={item} className="flex items-center gap-2 lg:gap-3">
                <CircleCheck className="h-4 w-4 lg:h-5 lg:w-5 text-primary flex-shrink-0" />
                <span className="text-base lg:text-lg font-medium text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Right grid - Benefits */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 flex-1">
          {[
            'Menos visitas improductivas',
            'Menos riesgo de morosidad',
            'Decisiones más rápidas',
            'Mejor experiencia propietarios'
          ].map((text) => (
            <div key={text} className="bg-background border border-border rounded-lg lg:rounded-xl p-4 lg:p-6 flex items-center justify-center">
              <p className="text-xs lg:text-base font-medium text-foreground text-center">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // Slide 9 - Interesados reales (Hoy vs Con MOB)
    <div key="interesados" className="h-full flex flex-col items-center justify-center px-4 lg:px-12 py-8 lg:py-0">
      <h2 className="text-xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 lg:mb-4 text-center">
        Mostrá tus propiedades a interesados<br className="hidden lg:block" />reales y verificados
      </h2>
      <p className="text-base lg:text-xl text-muted-foreground mb-8 lg:mb-12 text-center">
        Con Hoggax, te ayudamos en esto
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-4xl w-full">
        <div className="bg-muted/40 border border-border rounded-xl lg:rounded-2xl p-5 lg:p-8">
          <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
            <span className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs lg:text-sm font-semibold text-foreground">1</span>
            <h3 className="text-lg lg:text-xl font-bold text-foreground">Hoy</h3>
          </div>
          <ul className="space-y-3 lg:space-y-4">
            {['Cualquiera consulta', 'Cualquiera visita', 'Baja intención real', 'Tiempo perdido'].map((item) => (
              <li key={item} className="flex items-center gap-2 lg:gap-3">
                <X className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm lg:text-base text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-primary/5 border-2 border-primary/30 rounded-xl lg:rounded-2xl p-5 lg:p-8">
          <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
            <span className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs lg:text-sm font-semibold text-primary">2</span>
            <h3 className="text-lg lg:text-xl font-bold text-foreground">Con <span className="font-ubuntu">mob</span></h3>
          </div>
          <ul className="space-y-3 lg:space-y-4">
            {['Interesados verificados', 'Precalificados por Hoggax', 'Visitas con intención real', 'Menos fricción con propietarios'].map((item) => (
              <li key={item} className="flex items-center gap-2 lg:gap-3">
                <CircleCheck className="h-4 w-4 lg:h-5 lg:w-5 text-primary flex-shrink-0" />
                <span className="text-sm lg:text-base text-foreground font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,

    // Slide 10 - Supervisión
    <div key="supervision" className="h-full flex flex-col items-center justify-center px-4 lg:px-12 py-8 lg:py-0">
      <h2 className="text-xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-8 lg:mb-12 text-center">
        Todo el proceso bajo control<br />sin estar encima
      </h2>
      <div className="bg-muted/40 border border-border rounded-xl lg:rounded-2xl divide-y divide-border max-w-xl w-full mb-6 lg:mb-8">
        {[
          { icon: Home, title: 'Estado de cada propiedad', desc: 'De publicada a contrato, en tiempo real' },
          { icon: UserCheck, title: 'Interesados verificados', desc: 'Solo perfiles listos para alquilar' },
          { icon: Calendar, title: 'Visitas y seguimiento', desc: 'Agendadas, confirmadas y realizadas' },
          { icon: FileSignature, title: 'Contratos y post-alquiler', desc: 'Firma, vigencia y relación con el cliente' }
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 lg:gap-4 px-5 py-4 lg:px-8 lg:py-5">
            <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-base lg:text-lg font-medium text-foreground">{title}</p>
              <p className="text-xs lg:text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-base lg:text-lg text-muted-foreground text-center">
        <span className="font-ubuntu font-semibold text-foreground">mob</span> ejecuta. Tu inmobiliaria decide.
      </p>
    </div>,

    // Slide 11 - Métricas
    <div key="metricas" className="h-full flex flex-col items-center justify-center px-4 lg:px-12">
      <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-10 lg:mb-16 text-center">
        Impacto real del modelo
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 max-w-4xl w-full">
        {[
          { num: '100%', label: 'leads calificados' },
          { num: '0', label: 'visitas improductivas' },
          { num: '40', label: 'horas semanales ahorradas en trabajo administrativo' }
        ].map(({ num, label }) => (
          <div key={label} className="bg-background border border-border rounded-xl p-5 lg:p-6 text-center">
            <p className="text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-2 lg:mb-3">{num}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>,

    // Slide 12 - Features
    <div key="features" className="h-full flex flex-col items-center justify-center px-4 lg:px-12 py-8 lg:py-0">
      <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 lg:mb-4 text-center">
        <span className="font-ubuntu">mob</span> para Inmobiliarias
      </h2>
      <p className="text-base lg:text-xl text-muted-foreground mb-8 lg:mb-12 text-center">
        Infraestructura operativa para escalar alquileres.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 max-w-4xl mb-8 lg:mb-12 w-full">
        {[
          { icon: Megaphone, text: 'Publicación y gestión' },
          { icon: Calendar, text: 'Coordinación de visitas' },
          { icon: UserCheck, text: 'Inquilinos verificados' },
          { icon: FileSignature, text: 'Contratos digitales' },
          { icon: Headphones, text: 'Gestión post-alquiler' },
          { icon: LayoutDashboard, text: 'Panel de control' },
          { icon: Building2, text: 'Integración Tokko' },
          { icon: CheckCircle2, text: 'Pago por operación' }
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="bg-muted/40 border border-border rounded-lg lg:rounded-xl p-4 lg:p-5 text-center">
            <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary mx-auto mb-2 lg:mb-3" />
            <p className="text-xs lg:text-sm font-medium text-foreground">{text}</p>
          </div>
        ))}
      </div>
      <div className="bg-primary text-primary-foreground rounded-xl lg:rounded-2xl py-5 px-8 lg:py-6 lg:px-12 text-center">
        <p className="text-xs lg:text-sm uppercase tracking-wider mb-1 opacity-80">Costo de plataforma</p>
        <p className="text-3xl lg:text-4xl font-bold">20%</p>
        <p className="text-sm lg:text-base mt-1">del primer mes de contrato</p>
      </div>
    </div>,

    // Slide 13 - Cierre
    <div key="cierre" className="h-full flex flex-col items-center justify-center text-center px-4 lg:px-12 bg-gradient-to-b from-background to-primary/5">
      <h2 className="text-3xl lg:text-5xl xl:text-7xl font-bold text-foreground mb-4 lg:mb-6 leading-tight">
        Delegá la operación.<br />
        <span className="text-primary">Conservá el control.</span>
      </h2>
      <p className="text-base lg:text-xl text-muted-foreground mb-8 lg:mb-12 max-w-2xl">
        <span className="font-ubuntu">mob</span> ejecuta el proceso del alquiler.<br />
        Tu inmobiliaria decide y cierra.
      </p>
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
        <Button size="lg" className="text-base lg:text-lg px-8 py-5 lg:px-10 lg:py-6">
          Sumar mi inmobiliaria
          <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
        </Button>
        <Button size="lg" variant="outline" className="text-base lg:text-lg px-8 py-5 lg:px-10 lg:py-6">
          Hablar con un asesor
        </Button>
      </div>
    </div>
  ];

  return (
    <div className="h-screen w-screen bg-background overflow-hidden relative">
      {/* Slide container */}
      <div 
        className="h-full w-full transition-transform duration-500 ease-out flex"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className="h-full w-full flex-shrink-0"
            style={{ aspectRatio: '16/9' }}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Navigation arrows - hidden on mobile/tablet */}
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur border border-border items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        disabled={currentSlide === TOTAL_SLIDES - 1}
        className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur border border-border items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Desktop: Dots navigation */}
      <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 gap-2">
        {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Mobile/Tablet: Arrow navigation with slide counter */}
      <div className="flex lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 items-center gap-6">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-muted-foreground font-medium min-w-[50px] text-center">
          {currentSlide + 1}/{TOTAL_SLIDES}
        </span>
        <button
          onClick={nextSlide}
          disabled={currentSlide === TOTAL_SLIDES - 1}
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slide counter - desktop only */}
      <div className="hidden lg:block absolute bottom-6 right-6 text-sm text-muted-foreground">
        {currentSlide + 1} / {TOTAL_SLIDES}
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6">
        <img src={isotipo} alt="MOB" className="h-8" />
      </div>
    </div>
  );
};

export default PresentacionComercial3;
