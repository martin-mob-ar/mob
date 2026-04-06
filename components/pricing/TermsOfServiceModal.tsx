"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsOfServiceModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <p className="text-center text-xs text-muted-foreground">
        Al publicar tu propiedad, aceptás los{" "}
        <button
          type="button"
          className="underline hover:text-foreground transition-colors"
          onClick={() => setOpen(true)}
        >
          términos de servicio
        </button>
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-bold">
              Términos de servicio
            </DialogTitle>
            <DialogDescription>
              Última actualización: abril 2026
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[65vh] px-6 pb-6">
            <div className="prose prose-sm max-w-none text-foreground/80 space-y-8 pr-4">
              {/* ===== PLAN BÁSICO ===== */}
              <section>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                  Términos y Condiciones – Plan Básico
                </h2>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  1. Objeto
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El presente documento regula el acceso y uso del Plan Básico ofrecido por Mob (en adelante, la &quot;Plataforma&quot;), consistente en herramientas digitales para la publicación de propiedades y la interacción entre usuarios.
                  </p>
                  <p className="leading-relaxed text-sm">
                    Mob brinda exclusivamente una plataforma de servicios informáticos, sin participar en la gestión directa de operaciones inmobiliarias.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  2. Naturaleza del servicio
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">El Plan Básico incluye:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Publicación de propiedades</li>
                    <li>Carga y gestión de contenido por parte del usuario</li>
                    <li>Herramientas digitales de mejora de avisos</li>
                    <li>Funcionalidades básicas de la Plataforma</li>
                  </ul>
                  <p className="leading-relaxed text-sm">
                    Mob no administra alquileres. Su actividad se limita a proveer servicios informáticos que facilitan la conexión e interacción entre usuarios.
                  </p>
                  <p className="leading-relaxed text-sm">Mob:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>No actúa como intermediario inmobiliario</li>
                    <li>No administra propiedades ni alquileres</li>
                    <li>No representa a ninguna de las partes</li>
                    <li>No participa en negociaciones</li>
                    <li>No interviene en la formalización de acuerdos</li>
                  </ul>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  3. Condición de uso
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">El usuario declara:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Ser titular o contar con facultades suficientes sobre la propiedad</li>
                    <li>Que la información publicada es veraz, completa y actualizada</li>
                    <li>Que utilizará la Plataforma conforme a la normativa vigente</li>
                  </ul>
                  <p className="leading-relaxed text-sm">
                    Mob podrá suspender o eliminar publicaciones que incumplan estos términos.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  4. Publicaciones
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">El usuario es el único responsable por:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>El contenido publicado</li>
                    <li>La veracidad de la información</li>
                    <li>Las condiciones del inmueble ofrecido</li>
                  </ul>
                  <p className="leading-relaxed text-sm">
                    Mob no verifica ni certifica la información publicada en el Plan Básico.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  5. Interacción entre usuarios
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">La Plataforma puede facilitar el contacto entre usuarios, pero:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>No interviene en conversaciones</li>
                    <li>No participa en acuerdos</li>
                    <li>No administra la relación entre las partes</li>
                  </ul>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  6. Visitas a propiedades
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    Mob no organiza ni participa en las visitas a las propiedades. En consecuencia:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>No interviene en la coordinación efectiva de encuentros</li>
                    <li>No garantiza la identidad, conducta ni intenciones de los usuarios</li>
                    <li>No supervisa las condiciones en que se realizan las visitas</li>
                  </ul>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  7. Pagos y acuerdos entre usuarios
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">Mob no participa ni interviene en:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Pagos entre usuarios</li>
                    <li>Transferencias de dinero</li>
                    <li>Entrega de señas, depósitos o alquileres</li>
                    <li>Condiciones económicas pactadas</li>
                  </ul>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  8. Relación contractual entre usuarios
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">Mob no interviene en:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>La redacción de contratos</li>
                    <li>La firma de acuerdos</li>
                    <li>La ejecución de contratos de alquiler</li>
                    <li>El cumplimiento de obligaciones entre las partes</li>
                  </ul>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  9. Limitación de responsabilidad
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">Mob no será responsable por:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>La concreción o no de acuerdos</li>
                    <li>Incumplimientos contractuales</li>
                    <li>Daños, perjuicios o conflictos entre usuarios</li>
                    <li>Hechos ocurridos durante visitas a propiedades</li>
                    <li>Pagos realizados entre las partes</li>
                    <li>Fraudes, engaños o información falsa proporcionada por usuarios</li>
                  </ul>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  10. Costo del servicio
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El Plan Básico no tiene costo de acceso inicial. Mob podrá ofrecer funcionalidades adicionales o servicios complementarios con costo, los cuales serán informados previamente.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  11–15. Disponibilidad, propiedad intelectual, datos, modificaciones y legislación
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    Mob podrá realizar modificaciones o interrupciones técnicas sin previo aviso. Todos los derechos sobre la Plataforma pertenecen a Mob. Los datos personales serán tratados conforme a la Política de Privacidad. Mob podrá modificar estos términos en cualquier momento. Se rigen por las leyes de la República Argentina.
                  </p>
                </div>
              </section>

              {/* ===== PLAN ACOMPAÑADO ===== */}
              <section>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                  Términos y Condiciones – Plan Acompañado
                </h2>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  1. Objeto
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El presente documento regula el acceso y uso del Plan Acompañado ofrecido por Mob (en adelante, la &quot;Plataforma&quot;), que consiste en la provisión de herramientas digitales destinadas a facilitar la gestión del proceso de alquiler entre usuarios.
                  </p>
                  <p className="leading-relaxed text-sm">
                    Mob brinda exclusivamente una plataforma de servicios informáticos, sin administrar alquileres ni intervenir como parte en las operaciones entre usuarios.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  2. Naturaleza del servicio
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">El Plan Acompañado incluye:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Publicación destacada de propiedades</li>
                    <li>Herramientas digitales para gestión de interesados</li>
                    <li>Funcionalidades de validación y análisis de perfiles</li>
                    <li>Herramientas de coordinación y seguimiento del proceso</li>
                  </ul>
                  <p className="leading-relaxed text-sm">Mob no administra alquileres. Mob:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>No actúa como intermediario inmobiliario</li>
                    <li>No administra propiedades ni alquileres</li>
                    <li>No representa a ninguna de las partes</li>
                    <li>No toma decisiones sobre la selección de inquilinos</li>
                    <li>No participa en negociaciones ni acuerdos</li>
                  </ul>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  3–4. Condición de uso y publicaciones
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El usuario declara ser titular o contar con facultades suficientes sobre la propiedad, que la información es veraz y que utilizará la Plataforma conforme a la normativa vigente. El usuario es el único responsable por el contenido publicado.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  5. Validación y análisis de perfiles
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    Las herramientas de validación son automatizadas o basadas en información de terceros. No constituyen garantía de solvencia ni de cumplimiento. No reemplazan la evaluación personal del usuario.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  6–10. Coordinación, interacción, visitas, pagos y relación contractual
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    Mob facilita herramientas de organización de visitas, seguimiento y comunicaciones, pero no organiza visitas de manera directa, no participa en encuentros ni garantiza resultados. No interviene en pagos, transferencias, redacción de contratos, firma de acuerdos ni cumplimiento de obligaciones. Toda relación se establece exclusivamente entre usuarios.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  11. Servicios de terceros
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    La Plataforma puede integrar servicios de terceros, prestados por entidades independientes con sus propios términos. Mob no asume responsabilidad sobre los mismos.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  12. Costo del servicio
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El acceso inicial al Plan puede no requerir pago. El costo del servicio se devenga únicamente en caso de que el usuario decida avanzar con la utilización completa de las herramientas y el alquiler se concrete. En dicho caso, se abonará un monto fijo de USD 99.
                  </p>
                  <p className="leading-relaxed text-sm">
                    El costo corresponde al uso de la infraestructura tecnológica. No constituye honorarios por intermediación ni se encuentra vinculado a la negociación entre las partes.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  13–18. Responsabilidad, disponibilidad, propiedad intelectual, datos, modificaciones y legislación
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    Mob no será responsable por decisiones de usuarios, resultados, incumplimientos, hechos ocurridos durante visitas, pagos entre usuarios, daños o conflictos. El uso es bajo exclusiva responsabilidad del usuario. Se rigen por las leyes de la República Argentina.
                  </p>
                </div>
              </section>

              {/* ===== PLAN EXPERIENCIA MOB ===== */}
              <section>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                  Términos y Condiciones – Experiencia Mob
                </h2>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  1. Objeto
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El presente documento regula el acceso y uso del plan Experiencia Mob ofrecido por Mob (en adelante, la &quot;Plataforma&quot;), que consiste en un conjunto integral de herramientas digitales y servicios asociados destinados a facilitar la gestión del proceso de alquiler entre usuarios.
                  </p>
                  <p className="leading-relaxed text-sm">
                    Mob brinda exclusivamente una plataforma de servicios informáticos, sin administrar alquileres ni intervenir como parte en las operaciones entre usuarios.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  2. Naturaleza del servicio
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">El plan Experiencia Mob incluye:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Publicación optimizada de propiedades</li>
                    <li>Herramientas avanzadas de gestión de interesados</li>
                    <li>Validación y análisis de perfiles</li>
                    <li>Herramientas de coordinación y seguimiento</li>
                    <li>Acceso a servicios complementarios de terceros</li>
                  </ul>
                  <p className="leading-relaxed text-sm">Mob no administra alquileres. Mob:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>No actúa como intermediario inmobiliario</li>
                    <li>No administra propiedades ni alquileres</li>
                    <li>No representa a ninguna de las partes</li>
                    <li>No toma decisiones sobre selección de inquilinos</li>
                    <li>No participa en negociaciones ni acuerdos</li>
                  </ul>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  3. Servicios de fotografía
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El plan puede incluir acceso a servicios de fotografía profesional, prestados por proveedores terceros independientes. Mob actúa únicamente como facilitador del contacto y no se responsabiliza por el accionar del fotógrafo.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  4–5. Condición de uso y publicaciones
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El usuario declara ser titular o contar con facultades suficientes sobre la propiedad, que la información es veraz y que utilizará la Plataforma conforme a la normativa vigente. El usuario es responsable por el contenido publicado. Mob no verifica ni certifica la información.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  6–11. Perfiles, coordinación, interacción, visitas, pagos y relación contractual
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    Las herramientas de validación son automatizadas y no garantizan solvencia ni comportamiento. Mob facilita herramientas de coordinación pero no organiza ni ejecuta visitas. No interviene en conversaciones, acuerdos, pagos, transferencias, redacción de contratos, firma ni cumplimiento de obligaciones. Los contratos son exclusivamente entre usuarios.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  12. Servicios de terceros
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    La Plataforma puede facilitar acceso a servicios de terceros (incluyendo fotografía, garantías u otros), prestados por terceros independientes con sus propios términos. Mob no asume responsabilidad sobre los mismos.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  13. Costo del servicio
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    El plan Experiencia Mob tiene un costo asociado al acceso y uso de las herramientas digitales y servicios informáticos. El costo corresponde a la utilización de la infraestructura tecnológica. No constituye honorarios por intermediación ni está vinculado a la negociación entre las partes. Las condiciones económicas serán informadas previamente.
                  </p>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  14–19. Responsabilidad, disponibilidad, propiedad intelectual, datos, modificaciones y legislación
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="leading-relaxed text-sm">
                    Mob no será responsable por servicios de terceros, decisiones de usuarios, incumplimientos, hechos en visitas, pagos entre usuarios, ni daños o conflictos derivados de relaciones entre usuarios. Mob podrá realizar modificaciones o interrupciones técnicas sin previo aviso. Se rige por las leyes de la República Argentina.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
