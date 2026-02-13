import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Lock, 
  CheckCircle2, 
  X, 
  ArrowRight,
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
  Home
} from "lucide-react";
const isotipo = "/assets/isotipo-mob.png";

const ACCESS_CODE = "1234";

const PresentacionComercial = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <img src={isotipo} alt="MOB" className="h-8" />
          <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">Presentación Comercial</span>
        </div>
      </header>

      <main className="pt-20">
        {/* SLIDE 1 — HERO */}
        <section className="min-h-[85vh] flex items-center py-20 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-20">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 tracking-tight">
                Digitalizá tus alquileres
              </h1>
              <h2 className="text-xl md:text-2xl text-primary font-medium mb-8">
                Delegá la operación. Conservá el control.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Nos encargamos de todo el proceso: promoción, generación y verificación de interesados, coordinación de visitas, contrato, firma electrónica y ofrecemos administrar el alquiler.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-muted/40 border border-border rounded-xl p-6 text-center">
                <Megaphone className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">MOB ejecuta la operación</h3>
                <p className="text-sm text-muted-foreground">Publicación, interesados, visitas y contratos.</p>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-6 text-center">
                <Eye className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Tu inmobiliaria mantiene el control</h3>
                <p className="text-sm text-muted-foreground">Supervisás, aprobás y cerrás.</p>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-6 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Todo verificado desde el inicio</h3>
                <p className="text-sm text-muted-foreground">Inquilinos verificados con Hoggax.</p>
              </div>
            </div>
            
            <p className="text-center text-xl font-semibold text-foreground mb-8">
              Menos tareas. Más foco en lo que importa. Sin costo de estructura.
            </p>
            
            <p className="text-center text-muted-foreground text-sm">
              Bajá para ver más
            </p>
          </div>
        </section>

        {/* SLIDE 2 — El dolor real */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            {/* 1. Título fuerte */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                Los problemas de manejar alquileres
              </h2>
            </div>
            
            {/* 2. Bloque 1 — Los dolores reales */}
            <div className="mb-16">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: 'Consultas sin filtrar', desc: 'Interesados que no cumplen requisitos básicos.' },
                  { title: 'Visitas improductivas', desc: 'Tiempo perdido mostrando a personas que no avanzan.' },
                  { title: 'Procedimientos manuales', desc: 'Tareas repetitivas para tu equipo.' },
                  { title: 'Interesados sin respaldo', desc: 'Sin garantía clara ni capacidad de pago validada.' },
                  { title: 'Procesos lentos', desc: 'Cada paso depende del equipo interno.' },
                  { title: 'Administración dispersa', desc: 'Pagos, reclamos y seguimientos fuera de sistema.' }
                ].map(({ title, desc }) => (
                  <div key={title} className="bg-muted/60 border border-border rounded-xl p-5">
                    <p className="font-semibold text-foreground mb-1">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 3. Frase de quiebre */}
            <div className="py-12 text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                Mucho foco operativo<br />
                <span className="text-primary">te saca el foco en lo importante.</span>
              </p>
            </div>
            
            {/* 4. Bloque 2 — Modelo tradicional */}
            <div className="mb-16">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">
                Modelo tradicional de alquiler
              </h3>
              <div className="bg-muted/40 border border-border rounded-xl p-6 overflow-x-auto mb-4">
                <div className="flex items-center gap-2 text-sm min-w-max justify-center">
                  {['Publicar', 'Responder', 'Filtrar', 'Coordinar visitas', 'Verificar', 'Armar contrato', 'Administrar'].map((step, i, arr) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="bg-background border border-border px-3 py-2 rounded-lg font-medium text-foreground">{step}</span>
                      {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-center text-muted-foreground">
                Con estas tareas, tu equipo no está enfocado en lo importante: <span className="font-medium text-foreground">generar relaciones</span>
              </p>
            </div>
            
            {/* 5. Bloque 3 — Consecuencias */}
            <div className="mb-16">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">
                Consecuencias del modelo actual
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {['Saturación operativa', 'Errores humanos', 'Pérdida de oportunidades', 'Equipos quemados', 'Crecimiento limitado'].map((text) => (
                  <div key={text} className="bg-foreground/5 border border-border rounded-lg px-4 py-4 text-center">
                    <p className="text-sm font-semibold text-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 6. Transición hacia la solución */}
            <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-8 text-center">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                Separar operación de decisión
              </h3>
              <p className="text-lg font-semibold text-primary mb-4">
                Ejecutar no es lo mismo que decidir.
              </p>
              <p className="text-muted-foreground max-w-xl mx-auto">
                La operación puede delegarse sin perder control.
              </p>
            </div>
          </div>
        </section>

        {/* SLIDE 3 — Cuello de botella */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Mostrá tus propiedades a interesados reales y verificados
              </h2>
              <p className="text-xl text-muted-foreground">
                Con Hoggax, te ayudamos en esto
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hoy */}
              <div className="bg-muted/40 border border-border rounded-2xl p-8">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-sm">1</span>
                  Hoy
                </h3>
                <ul className="space-y-3">
                  {[
                    'Cualquiera consulta',
                    'Cualquiera visita',
                    'Baja intención real',
                    'Tiempo perdido'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-muted-foreground">
                      <X className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Con MOB */}
              <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary">2</span>
                  Con MOB
                </h3>
                <ul className="space-y-3">
                  {[
                    'Interesados verificados',
                    'Precalificados por Hoggax',
                    'Visitas con intención real',
                    'Menos fricción con propietarios'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 4 — Qué es MOB */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-16 text-center">
              mob es infraestructura operativa para alquileres
            </h2>
            
            <div className="bg-primary/5 border-2 border-primary rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Ejecutamos el proceso operativo del alquiler</span>
              </div>
              <p className="text-muted-foreground">
                MOB hace el trabajo pesado. Tu inmobiliaria supervisa, decide y cierra.
              </p>
            </div>
          </div>
        </section>

        {/* SLIDE 5 — Separar operación de decisión */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Ejecutar no es lo mismo que decidir
              </h2>
            </div>
            
            {/* Sin MOB */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Sin MOB</p>
              <div className="bg-muted/40 border border-border rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center gap-2 text-sm min-w-max">
                  <span className="bg-foreground text-background px-3 py-1.5 rounded-md font-medium">Inmobiliaria</span>
                  {['Publica', 'Filtra', 'Coordina', 'Verifica', 'Contrata', 'Administra'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="bg-background border px-3 py-1.5 rounded-md">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Todo pasa por el mismo equipo.</p>
            </div>
            
            {/* Con MOB */}
            <div className="mb-12">
              <p className="text-sm text-primary uppercase tracking-wider mb-4">Con MOB</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-primary/5 border border-primary/30 rounded-xl p-6">
                  <p className="text-sm font-semibold text-primary mb-4">MOB ejecuta</p>
                  <div className="flex flex-wrap gap-2">
                    {['Publicación', 'Interesados', 'Verificación', 'Contratos', 'Administración'].map((item) => (
                      <span key={item} className="bg-background border border-primary/20 px-3 py-1.5 rounded-md text-sm">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/40 border border-border rounded-xl p-6">
                  <p className="text-sm font-semibold text-foreground mb-4">Inmobiliaria</p>
                  <div className="flex flex-wrap gap-2">
                    {['Visitas', 'Supervisa'].map((item) => (
                      <span key={item} className="bg-background border px-3 py-1.5 rounded-md text-sm font-medium">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-foreground text-background rounded-xl p-6 text-center">
              <p className="text-lg md:text-xl font-semibold">
                Delegar la operación no es perder control. <span className="text-primary">Es ganar foco.</span>
              </p>
            </div>
          </div>
        </section>

        {/* SLIDE 6 — Verificación Hoggax */}
        <section className="py-24 px-6 bg-primary/5">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                Verificación de inquilinos por Hoggax
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Checklist */}
              <div className="bg-background border border-border rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Qué verifica Hoggax</h3>
                <ul className="space-y-4">
                  {['Identidad', 'Antecedentes', 'Situación financiera', 'Capacidad de pago'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Beneficios */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Menos visitas improductivas',
                  'Menos riesgo de morosidad',
                  'Decisiones más rápidas',
                  'Mejor experiencia propietarios'
                ].map((text) => (
                  <div key={text} className="bg-background border border-border rounded-xl p-4 text-center flex items-center justify-center">
                    <p className="text-sm font-medium text-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-center text-lg font-semibold text-foreground">
              Filtrar antes es más barato que corregir después.
            </p>
          </div>
        </section>

        {/* SLIDE 7 — Supervisión y administración */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-16 text-center">
              Supervisión en tiempo real, sin desgaste operativo
            </h2>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-muted/40 border border-border rounded-2xl divide-y divide-border">
                {[
                  { icon: Home, text: 'Estado de cada propiedad' },
                  { icon: UserCheck, text: 'Interesados verificados' },
                  { icon: Calendar, text: 'Visitas agendadas y realizadas' },
                  { icon: FileSignature, text: 'Contratos en curso' },
                  { icon: Headphones, text: 'Post-alquiler' }
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-4 px-6 py-4">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-center text-lg font-semibold text-foreground mt-12">
              No perdés control. <span className="text-primary">Ganás visibilidad y orden.</span>
            </p>
          </div>
        </section>

        {/* SLIDE 8 — Impacto del modelo */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-16 text-center">
              Impacto real del modelo
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { num: '70%', label: 'menos carga operativa' },
                { num: '2×', label: 'más cierres efectivos' },
                { num: '+4.000', label: 'inquilinos verificados / mes' },
                { num: '+1.200', label: 'contratos firmados' },
                { num: '+8.000', label: 'visitas gestionadas' }
              ].map(({ num, label }, i) => (
                <div 
                  key={label} 
                  className={`bg-background border border-border rounded-xl p-6 text-center ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}
                >
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{num}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 9 — mob para Inmobiliarias */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                mob para Inmobiliarias
              </h2>
              <p className="text-lg text-muted-foreground">
                Infraestructura operativa para digitalizar y escalar alquileres.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
              {[
                { icon: Megaphone, text: 'Publicación y gestión de propiedades' },
                { icon: Calendar, text: 'Coordinación de visitas' },
                { icon: UserCheck, text: 'Inquilinos verificados con Hoggax' },
                { icon: FileSignature, text: 'Contratos digitales' },
                { icon: Headphones, text: 'Gestión post-alquiler' },
                { icon: LayoutDashboard, text: 'Panel de control online' },
                { icon: Building2, text: 'Integración con Tokko Broker' },
                { icon: CheckCircle2, text: 'Modelo por operación cerrada' }
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{text}</p>
                </div>
              ))}
            </div>
            
            {/* Pricing */}
            <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-8 text-center mb-8">
              <p className="text-xl font-bold text-foreground mb-4">
                Sin costos fijos. Pagás cuando cerrás.
              </p>
              <div className="bg-primary text-primary-foreground rounded-xl py-6 px-8 inline-block">
                <p className="text-sm uppercase tracking-wider mb-1 opacity-80">Costo de plataforma</p>
                <p className="text-2xl md:text-3xl font-bold">20%</p>
                <p className="text-base mt-1">del primer mes de contrato</p>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8">
                Sumar mi inmobiliaria a MOB
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8">
                Hablar con un asesor
              </Button>
            </div>
          </div>
        </section>

        {/* SLIDE 10 — Preguntas frecuentes */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Respondemos las dudas más comunes sobre cómo funciona MOB con inmobiliarias.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  q: '¿mob reemplaza a la inmobiliaria?',
                  a: 'No. MOB es infraestructura operativa. Tu inmobiliaria mantiene la relación con el cliente, toma las decisiones y cierra las operaciones. Nosotros ejecutamos el proceso operativo del alquiler.'
                },
                {
                  q: '¿Quién mantiene la relación con el cliente?',
                  a: 'Tu inmobiliaria. MOB trabaja en segundo plano para que vos puedas enfocarte en el vínculo comercial con propietarios e inquilinos, sin ocuparte del trabajo operativo.'
                },
                {
                  q: '¿Tiene costo fijo?',
                  a: 'No hay costos fijos de entrada. Solo participamos cuando se cierra una operación exitosa.'
                },
                {
                  q: '¿Cómo se integran las propiedades?',
                  a: 'Podés cargar propiedades manualmente desde el panel o integrarlas automáticamente con sistemas como Tokko Broker.'
                },
                {
                  q: '¿Qué pasa después del alquiler?',
                  a: 'También ofrecemos administración: gestión de pagos, tickets de mantenimiento, renovaciones y todo lo necesario hasta que termine el contrato.'
                }
              ].map(({ q, a }) => (
                <div key={q} className="bg-background border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 11 — Cierre */}
        <section className="py-32 px-6 bg-gradient-to-b from-background to-primary/5">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Delegá la operación.<br />
              <span className="text-primary">Conservá el control.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
              MOB ejecuta el proceso del alquiler.<br />
              Tu inmobiliaria decide y cierra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8">
                Sumar mi inmobiliaria a MOB
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8">
                Hablar con un asesor
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t bg-background">
          <div className="container mx-auto max-w-5xl flex items-center justify-between">
            <img src={isotipo} alt="MOB" className="h-7" />
            <p className="text-xs text-muted-foreground">Infraestructura operativa para alquileres</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default PresentacionComercial;
