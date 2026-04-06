import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Términos de servicio",
  description:
    "Términos de servicio de los planes ofrecidos por Mob. Información sobre Plan Básico, Plan Acompañado y Experiencia Mob.",
  alternates: { canonical: "/terminos-de-servicio" },
};

export default function TerminosDeServicioPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex items-center h-14 px-4">
            <Link href="/">
              <Image
                src="/assets/mob-logo-new.png"
                alt="mob"
                width={80}
                height={20}
                className="h-5 w-auto"
              />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Términos de servicio
          </h1>
          <p className="text-muted-foreground text-sm mb-10">
            Última actualización: abril 2026
          </p>

          <div className="prose prose-sm max-w-none text-foreground/80 space-y-8">
            {/* ===== PLAN BÁSICO ===== */}
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Términos y Condiciones – Plan Básico
              </h2>

              {/* 1. Objeto */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                1. Objeto
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  El presente documento regula el acceso y uso del Plan Básico ofrecido por Mob (en adelante, la &quot;Plataforma&quot;), consistente en herramientas digitales para la publicación de propiedades y la interacción entre usuarios.
                </p>
                <p className="leading-relaxed">
                  Mob brinda exclusivamente una plataforma de servicios informáticos, sin participar en la gestión directa de operaciones inmobiliarias.
                </p>
              </div>

              {/* 2. Naturaleza del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                2. Naturaleza del servicio
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El Plan Básico incluye:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Publicación de propiedades</li>
                  <li>Carga y gestión de contenido por parte del usuario</li>
                  <li>Herramientas digitales de mejora de avisos</li>
                  <li>Funcionalidades básicas de la Plataforma</li>
                </ul>
                <p className="leading-relaxed">
                  Mob no administra alquileres. Su actividad se limita a proveer servicios informáticos que facilitan la conexión e interacción entre usuarios.
                </p>
                <p className="leading-relaxed">Mob:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No actúa como intermediario inmobiliario</li>
                  <li>No administra propiedades ni alquileres</li>
                  <li>No representa a ninguna de las partes</li>
                  <li>No participa en negociaciones</li>
                  <li>No interviene en la formalización de acuerdos</li>
                </ul>
              </div>

              {/* 3. Condición de uso */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                3. Condición de uso
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El usuario declara:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ser titular o contar con facultades suficientes sobre la propiedad</li>
                  <li>Que la información publicada es veraz, completa y actualizada</li>
                  <li>Que utilizará la Plataforma conforme a la normativa vigente</li>
                </ul>
                <p className="leading-relaxed">
                  Mob podrá suspender o eliminar publicaciones que incumplan estos términos.
                </p>
              </div>

              {/* 4. Publicaciones */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                4. Publicaciones
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El usuario es el único responsable por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>El contenido publicado</li>
                  <li>La veracidad de la información</li>
                  <li>Las condiciones del inmueble ofrecido</li>
                </ul>
                <p className="leading-relaxed">
                  Mob no verifica ni certifica la información publicada en el Plan Básico.
                </p>
              </div>

              {/* 5. Interacción entre usuarios */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                5. Interacción entre usuarios
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">La Plataforma puede facilitar el contacto entre usuarios, pero:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No interviene en conversaciones</li>
                  <li>No participa en acuerdos</li>
                  <li>No administra la relación entre las partes</li>
                </ul>
                <p className="leading-relaxed">
                  Cualquier vínculo se establece exclusivamente entre los usuarios.
                </p>
              </div>

              {/* 6. Visitas a propiedades */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                6. Visitas a propiedades
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  Mob no organiza ni participa en las visitas a las propiedades. En consecuencia:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No interviene en la coordinación efectiva de encuentros</li>
                  <li>No garantiza la identidad, conducta ni intenciones de los usuarios</li>
                  <li>No supervisa las condiciones en que se realizan las visitas</li>
                </ul>
                <p className="leading-relaxed">
                  Las visitas se realizan bajo exclusiva responsabilidad de las partes involucradas.
                </p>
              </div>

              {/* 7. Pagos y acuerdos entre usuarios */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                7. Pagos y acuerdos entre usuarios
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no participa ni interviene en:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Pagos entre usuarios</li>
                  <li>Transferencias de dinero</li>
                  <li>Entrega de señas, depósitos o alquileres</li>
                  <li>Condiciones económicas pactadas</li>
                </ul>
                <p className="leading-relaxed">
                  La Plataforma no actúa como agente de cobro ni de pago. Cualquier acuerdo económico es responsabilidad exclusiva de las partes, así como los riesgos derivados de dichos acuerdos.
                </p>
              </div>

              {/* 8. Relación contractual entre usuarios */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                8. Relación contractual entre usuarios
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no interviene en:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>La redacción de contratos</li>
                  <li>La firma de acuerdos</li>
                  <li>La ejecución de contratos de alquiler</li>
                  <li>El cumplimiento de obligaciones entre las partes</li>
                </ul>
                <p className="leading-relaxed">
                  Cualquier contrato celebrado es exclusivamente entre los usuarios.
                </p>
              </div>

              {/* 9. Limitación de responsabilidad */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                9. Limitación de responsabilidad
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no será responsable por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>La concreción o no de acuerdos</li>
                  <li>Incumplimientos contractuales</li>
                  <li>Daños, perjuicios o conflictos entre usuarios</li>
                  <li>Hechos ocurridos durante visitas a propiedades</li>
                  <li>Pagos realizados entre las partes</li>
                  <li>Fraudes, engaños o información falsa proporcionada por usuarios</li>
                </ul>
                <p className="leading-relaxed">
                  El uso de la Plataforma es bajo exclusiva responsabilidad del usuario.
                </p>
              </div>

              {/* 10. Costo del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                10. Costo del servicio
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  El Plan Básico no tiene costo de acceso inicial.
                </p>
                <p className="leading-relaxed">
                  Mob podrá ofrecer funcionalidades adicionales o servicios complementarios con costo, los cuales serán informados previamente.
                </p>
              </div>

              {/* 11. Disponibilidad del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                11. Disponibilidad del servicio
              </h3>
              <p className="leading-relaxed mb-6">
                Mob podrá realizar modificaciones, mejoras o interrupciones técnicas sin previo aviso, sin garantizar disponibilidad continua.
              </p>

              {/* 12. Propiedad intelectual */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                12. Propiedad intelectual
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  Todos los derechos sobre la Plataforma pertenecen a Mob.
                </p>
                <p className="leading-relaxed">
                  El usuario otorga a Mob una licencia para mostrar el contenido dentro de la Plataforma.
                </p>
              </div>

              {/* 13. Protección de datos */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                13. Protección de datos
              </h3>
              <p className="leading-relaxed mb-6">
                Los datos personales serán tratados conforme a la Política de Privacidad.
              </p>

              {/* 14. Modificaciones */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                14. Modificaciones
              </h3>
              <p className="leading-relaxed mb-6">
                Mob podrá modificar estos términos en cualquier momento, entrando en vigencia desde su publicación.
              </p>

              {/* 15. Legislación aplicable */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                15. Legislación aplicable
              </h3>
              <p className="leading-relaxed">
                Estos términos se rigen por las leyes de la República Argentina.
              </p>
            </section>

            {/* ===== PLAN ACOMPAÑADO ===== */}
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Términos y Condiciones – Plan Acompañado
              </h2>

              {/* 1. Objeto */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                1. Objeto
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  El presente documento regula el acceso y uso del Plan Acompañado ofrecido por Mob (en adelante, la &quot;Plataforma&quot;), que consiste en la provisión de herramientas digitales destinadas a facilitar la gestión del proceso de alquiler entre usuarios.
                </p>
                <p className="leading-relaxed">
                  Mob brinda exclusivamente una plataforma de servicios informáticos, sin administrar alquileres ni intervenir como parte en las operaciones entre usuarios.
                </p>
              </div>

              {/* 2. Naturaleza del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                2. Naturaleza del servicio
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El Plan Acompañado incluye:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Publicación destacada de propiedades</li>
                  <li>Herramientas digitales para gestión de interesados</li>
                  <li>Funcionalidades de validación y análisis de perfiles</li>
                  <li>Herramientas de coordinación y seguimiento del proceso</li>
                </ul>
                <p className="leading-relaxed">
                  Estas funcionalidades tienen como finalidad mejorar la organización y eficiencia del proceso entre usuarios.
                </p>
                <p className="leading-relaxed">Mob no administra alquileres. Mob:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No actúa como intermediario inmobiliario</li>
                  <li>No administra propiedades ni alquileres</li>
                  <li>No representa a ninguna de las partes</li>
                  <li>No toma decisiones sobre la selección de inquilinos</li>
                  <li>No participa en negociaciones ni acuerdos</li>
                </ul>
              </div>

              {/* 3. Condición de uso */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                3. Condición de uso
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El usuario declara:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ser titular o contar con facultades suficientes sobre la propiedad</li>
                  <li>Que la información publicada es veraz, completa y actualizada</li>
                  <li>Que utilizará la Plataforma conforme a la normativa vigente</li>
                </ul>
                <p className="leading-relaxed">
                  Mob podrá suspender o eliminar publicaciones que incumplan estos términos.
                </p>
              </div>

              {/* 4. Publicaciones */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                4. Publicaciones
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El usuario es el único responsable por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>El contenido publicado</li>
                  <li>La veracidad de la información</li>
                  <li>Las condiciones del inmueble ofrecido</li>
                </ul>
                <p className="leading-relaxed">
                  Mob no verifica ni certifica la información publicada.
                </p>
              </div>

              {/* 5. Validación y análisis de perfiles */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                5. Validación y análisis de perfiles
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  La Plataforma puede ofrecer herramientas de validación de identidad y análisis de perfiles. El usuario reconoce que:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Estas herramientas son automatizadas o basadas en información de terceros o del propio usuario</li>
                  <li>No constituyen garantía de solvencia ni de cumplimiento</li>
                  <li>No reemplazan la evaluación personal del usuario</li>
                </ul>
                <p className="leading-relaxed">
                  Mob no asume responsabilidad por decisiones tomadas en base a dichas herramientas.
                </p>
              </div>

              {/* 6. Coordinación y seguimiento */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                6. Coordinación y seguimiento
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">La Plataforma puede facilitar herramientas para:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Organización de visitas</li>
                  <li>Seguimiento de interesados</li>
                  <li>Automatización de comunicaciones</li>
                </ul>
                <p className="leading-relaxed">Sin embargo:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Mob no organiza visitas de manera directa</li>
                  <li>No participa en encuentros entre usuarios</li>
                  <li>No garantiza comportamiento, asistencia ni resultados</li>
                </ul>
              </div>

              {/* 7. Interacción entre usuarios */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                7. Interacción entre usuarios
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob facilita herramientas de contacto, pero:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No interviene en conversaciones</li>
                  <li>No participa en acuerdos</li>
                  <li>No administra la relación entre las partes</li>
                </ul>
                <p className="leading-relaxed">
                  Toda relación se establece exclusivamente entre usuarios.
                </p>
              </div>

              {/* 8. Visitas a propiedades */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                8. Visitas a propiedades
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  Mob no participa en la coordinación ni en la ejecución de visitas. En consecuencia:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No supervisa las condiciones en que se realizan</li>
                  <li>No garantiza la identidad ni el comportamiento de los participantes</li>
                  <li>No asume responsabilidad por hechos ocurridos durante las visitas</li>
                </ul>
                <p className="leading-relaxed">
                  Las visitas se realizan bajo exclusiva responsabilidad de las partes.
                </p>
              </div>

              {/* 9. Pagos y acuerdos entre usuarios */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                9. Pagos y acuerdos entre usuarios
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no participa ni interviene en:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Pagos o transferencias de dinero</li>
                  <li>Entrega de señas, depósitos o alquileres</li>
                  <li>Condiciones económicas pactadas</li>
                </ul>
                <p className="leading-relaxed">
                  La Plataforma no actúa como agente de cobro ni de pago.
                </p>
              </div>

              {/* 10. Relación contractual entre usuarios */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                10. Relación contractual entre usuarios
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no interviene en:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Redacción de contratos</li>
                  <li>Firma de acuerdos</li>
                  <li>Ejecución de contratos</li>
                  <li>Cumplimiento de obligaciones</li>
                </ul>
                <p className="leading-relaxed">
                  Cualquier contrato es celebrado exclusivamente entre usuarios.
                </p>
              </div>

              {/* 11. Servicios de terceros */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                11. Servicios de terceros
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  La Plataforma puede integrar o facilitar acceso a servicios de terceros. Dichos servicios:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Son prestados por entidades independientes</li>
                  <li>Se rigen por sus propios términos</li>
                </ul>
                <p className="leading-relaxed">
                  Mob no asume responsabilidad sobre los mismos.
                </p>
              </div>

              {/* 12. Costo del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                12. Costo del servicio
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  El Plan Acompañado incluye funcionalidades digitales avanzadas destinadas a facilitar la gestión del proceso dentro de la Plataforma. El usuario reconoce que:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>El acceso inicial al Plan puede no requerir pago</li>
                  <li>El costo del servicio se devenga únicamente en caso de que el usuario decida avanzar con la utilización completa de las herramientas de gestión provistas por la Plataforma y el alquiler se concrete.</li>
                </ul>
                <p className="leading-relaxed">
                  En dicho caso, se abonará un monto fijo de USD 99.
                </p>
                <p className="leading-relaxed">El usuario acepta que:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>El costo corresponde al uso de la infraestructura tecnológica y servicios informáticos brindados por la Plataforma</li>
                  <li>No constituye honorarios por intermediación ni se encuentra vinculado a la negociación entre las partes</li>
                  <li>Mob no participa ni tiene injerencia en la decisión de celebrar un acuerdo entre usuarios</li>
                </ul>
                <p className="leading-relaxed">
                  El eventual avance en un acuerdo entre usuarios es una decisión exclusiva de las partes y puede implicar, en caso de uso completo de la Plataforma, la activación del costo del servicio, sin que ello implique participación de Mob en dicha decisión.
                </p>
              </div>

              {/* 13. Limitación de responsabilidad */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                13. Limitación de responsabilidad
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no será responsable por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Decisiones tomadas por los usuarios</li>
                  <li>Resultados derivados del uso de la Plataforma</li>
                  <li>Incumplimientos entre las partes</li>
                  <li>Hechos ocurridos durante visitas</li>
                  <li>Pagos realizados entre usuarios</li>
                  <li>Daños, perjuicios o conflictos entre usuarios</li>
                  <li>Información falsa o inexacta proporcionada por usuarios</li>
                </ul>
                <p className="leading-relaxed">
                  El uso de la Plataforma es bajo exclusiva responsabilidad del usuario.
                </p>
              </div>

              {/* 14. Disponibilidad del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                14. Disponibilidad del servicio
              </h3>
              <p className="leading-relaxed mb-6">
                Mob podrá realizar modificaciones, mejoras o interrupciones técnicas sin previo aviso, sin garantizar disponibilidad continua.
              </p>

              {/* 15. Propiedad intelectual */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                15. Propiedad intelectual
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  Todos los derechos sobre la Plataforma pertenecen a Mob.
                </p>
                <p className="leading-relaxed">
                  El usuario otorga una licencia para el uso del contenido dentro de la misma.
                </p>
              </div>

              {/* 16. Protección de datos */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                16. Protección de datos
              </h3>
              <p className="leading-relaxed mb-6">
                Los datos personales serán tratados conforme a la Política de Privacidad.
              </p>

              {/* 17. Modificaciones */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                17. Modificaciones
              </h3>
              <p className="leading-relaxed mb-6">
                Mob podrá modificar estos términos en cualquier momento, entrando en vigencia desde su publicación.
              </p>

              {/* 18. Legislación aplicable */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                18. Legislación aplicable
              </h3>
              <p className="leading-relaxed">
                Los presentes términos se rigen por las leyes de la República Argentina.
              </p>
            </section>

            {/* ===== PLAN EXPERIENCIA MOB ===== */}
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Términos y Condiciones – Experiencia Mob
              </h2>

              {/* 1. Objeto */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                1. Objeto
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  El presente documento regula el acceso y uso del plan Experiencia Mob ofrecido por Mob (en adelante, la &quot;Plataforma&quot;), que consiste en un conjunto integral de herramientas digitales y servicios asociados destinados a facilitar la gestión del proceso de alquiler entre usuarios.
                </p>
                <p className="leading-relaxed">
                  Mob brinda exclusivamente una plataforma de servicios informáticos, sin administrar alquileres ni intervenir como parte en las operaciones entre usuarios.
                </p>
              </div>

              {/* 2. Naturaleza del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                2. Naturaleza del servicio
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El plan Experiencia Mob incluye:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Publicación optimizada de propiedades</li>
                  <li>Herramientas avanzadas de gestión de interesados</li>
                  <li>Validación y análisis de perfiles</li>
                  <li>Herramientas de coordinación y seguimiento</li>
                  <li>Acceso a servicios complementarios de terceros</li>
                </ul>
                <p className="leading-relaxed">
                  Estas funcionalidades tienen como finalidad mejorar la eficiencia del proceso.
                </p>
                <p className="leading-relaxed">Mob no administra alquileres. Mob:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No actúa como intermediario inmobiliario</li>
                  <li>No administra propiedades ni alquileres</li>
                  <li>No representa a ninguna de las partes</li>
                  <li>No toma decisiones sobre selección de inquilinos</li>
                  <li>No participa en negociaciones ni acuerdos</li>
                </ul>
              </div>

              {/* 3. Servicios de fotografía */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                3. Servicios de fotografía
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  El plan puede incluir la posibilidad de acceder a servicios de fotografía profesional para la propiedad. El usuario reconoce que:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>El servicio de fotografía es prestado por proveedores terceros independientes</li>
                  <li>Mob no presta directamente dicho servicio</li>
                  <li>La coordinación con Mob actuando únicamente como facilitador del contacto</li>
                </ul>
                <p className="leading-relaxed">En consecuencia:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Mob no se responsabiliza por el accionar del fotógrafo</li>
                  <li>Cualquier relación, acuerdo o ejecución del servicio se realiza directamente entre el usuario y el proveedor</li>
                </ul>
              </div>

              {/* 4. Condición de uso */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                4. Condición de uso
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El usuario declara:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ser titular o contar con facultades suficientes sobre la propiedad</li>
                  <li>Que la información publicada es veraz</li>
                  <li>Que utilizará la Plataforma conforme a la normativa vigente</li>
                </ul>
                <p className="leading-relaxed">
                  Mob podrá suspender publicaciones que incumplan estos términos.
                </p>
              </div>

              {/* 5. Publicaciones */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                5. Publicaciones
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">El usuario es responsable por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>El contenido publicado</li>
                  <li>La veracidad de la información</li>
                  <li>Las condiciones del inmueble</li>
                </ul>
                <p className="leading-relaxed">
                  Mob no verifica ni certifica la información.
                </p>
              </div>

              {/* 6. Validación y análisis de perfiles */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                6. Validación y análisis de perfiles
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  La Plataforma puede ofrecer herramientas de validación. El usuario reconoce que:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Son herramientas automatizadas o basadas en terceros</li>
                  <li>No garantizan solvencia ni comportamiento</li>
                  <li>No reemplazan su propio criterio</li>
                </ul>
              </div>

              {/* 7. Coordinación y seguimiento */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                7. Coordinación y seguimiento
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">La Plataforma puede facilitar:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Organización de visitas</li>
                  <li>Seguimiento de interesados</li>
                  <li>Automatizaciones</li>
                </ul>
                <p className="leading-relaxed">Sin embargo:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Mob no organiza ni ejecuta visitas</li>
                  <li>No participa en encuentros</li>
                  <li>No garantiza resultados</li>
                </ul>
              </div>

              {/* 8. Interacción entre usuarios */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                8. Interacción entre usuarios
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob facilita herramientas de contacto, pero:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No interviene en conversaciones</li>
                  <li>No participa en acuerdos</li>
                  <li>No administra la relación</li>
                </ul>
              </div>

              {/* 9. Visitas a propiedades */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                9. Visitas a propiedades
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no participa en visitas. Por lo tanto:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No supervisa su desarrollo</li>
                  <li>No garantiza identidad o comportamiento</li>
                  <li>No asume responsabilidad por hechos ocurridos</li>
                </ul>
              </div>

              {/* 10. Pagos entre usuarios */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                10. Pagos entre usuarios
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no interviene en:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Pagos</li>
                  <li>Transferencias</li>
                  <li>Entrega de dinero</li>
                </ul>
                <p className="leading-relaxed">
                  No actúa como agente de cobro ni de pago.
                </p>
              </div>

              {/* 11. Relación contractual */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                11. Relación contractual
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no interviene en:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Redacción de contratos</li>
                  <li>Firma</li>
                  <li>Ejecución</li>
                  <li>Cumplimiento</li>
                </ul>
                <p className="leading-relaxed">
                  Los contratos son exclusivamente entre usuarios.
                </p>
              </div>

              {/* 12. Servicios de terceros */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                12. Servicios de terceros
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  La Plataforma puede facilitar acceso a servicios de terceros (incluyendo, entre otros, fotografía, garantías u otros). Estos servicios:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Son prestados por terceros independientes</li>
                  <li>Se rigen por sus propios términos</li>
                </ul>
                <p className="leading-relaxed">
                  Mob no asume responsabilidad sobre los mismos.
                </p>
              </div>

              {/* 13. Costo del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                13. Costo del servicio
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">
                  El plan Experiencia Mob tiene un costo asociado al acceso y uso de las herramientas digitales y servicios informáticos brindados por la Plataforma. El usuario reconoce que:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>El costo corresponde a la utilización de la infraestructura tecnológica y servicios digitales</li>
                  <li>No constituye honorarios por intermediación</li>
                  <li>No está vinculado a la negociación entre las partes</li>
                </ul>
                <p className="leading-relaxed">
                  Las condiciones económicas serán informadas de manera previa a la contratación.
                </p>
              </div>

              {/* 14. Limitación de responsabilidad */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                14. Limitación de responsabilidad
              </h3>
              <div className="space-y-3 mb-6">
                <p className="leading-relaxed">Mob no será responsable por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Servicios prestados por terceros</li>
                  <li>Decisiones de los usuarios</li>
                  <li>Incumplimientos entre las partes</li>
                  <li>Hechos ocurridos en visitas</li>
                  <li>Pagos entre usuarios</li>
                  <li>Daños o conflictos derivados de relaciones entre usuarios</li>
                </ul>
              </div>

              {/* 15. Disponibilidad del servicio */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                15. Disponibilidad del servicio
              </h3>
              <p className="leading-relaxed mb-6">
                Mob podrá realizar modificaciones o interrupciones técnicas sin previo aviso.
              </p>

              {/* 16. Propiedad intelectual */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                16. Propiedad intelectual
              </h3>
              <p className="leading-relaxed mb-6">
                Todos los derechos sobre la Plataforma pertenecen a Mob.
              </p>

              {/* 17. Protección de datos */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                17. Protección de datos
              </h3>
              <p className="leading-relaxed mb-6">
                Los datos serán tratados conforme a la Política de Privacidad.
              </p>

              {/* 18. Modificaciones */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                18. Modificaciones
              </h3>
              <p className="leading-relaxed mb-6">
                Mob podrá modificar estos términos en cualquier momento.
              </p>

              {/* 19. Legislación aplicable */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                19. Legislación aplicable
              </h3>
              <p className="leading-relaxed">
                Se rige por las leyes de la República Argentina.
              </p>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
