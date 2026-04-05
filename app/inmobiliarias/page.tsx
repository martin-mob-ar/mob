import type { Metadata } from "next";
import LandingInmobiliarias from "@/views/LandingInmobiliarias";
import FAQJsonLd from "@/components/seo/FAQJsonLd";

export const metadata: Metadata = {
  title: "Inmobiliarias - Digitaliza tu gestion de alquileres",
  description:
    "Gestiona tus propiedades de forma digital con Mob. Contratos online, cobro automatico, verificacion de inquilinos y panel de gestion inmobiliaria.",
  alternates: { canonical: "/inmobiliarias" },
};

export default function InmobiliariasPage() {
  return (
    <>
      <FAQJsonLd
        items={[
          { question: "¿Mob reemplaza a mi equipo comercial?", answer: "No. Mob se encarga de la operación administrativa y de calificación. Tu equipo sigue siendo el vínculo comercial con el propietario y el inquilino." },
          { question: "¿Qué pasa si mis consultas llegan por otros canales?", answer: "Podés derivarlas al flujo de Mob fácilmente. No importa de dónde llegó el interesado." },
          { question: "¿Cómo funciona la validación del interesado?", answer: "Mob le envía un flujo por WhatsApp. El interesado valida su identidad con foto del DNI en menos de 1 minuto y sube su documentación sin fricciones." },
          { question: "¿Cómo se integra la garantía?", answer: "Dentro del mismo flujo. Si el interesado necesita garantía, Mob le ofrece acceso a Hoggax con 50% de descuento, sin salir del proceso." },
          { question: "¿Puedo seguir usando Tokko?", answer: "Sí. Mob se integra con Tokko para que no tengas que duplicar trabajo." },
          { question: "¿Quién mantiene el control de la operación?", answer: "Siempre vos. Mob ejecuta las validaciones y el flujo, pero la inmobiliaria tiene visibilidad completa en todo momento." },
          { question: "¿Cómo funciona la firma del contrato?", answer: "100% online. El interesado firma electrónicamente desde su celular. Sin presencia física, sin papeles." },
        ]}
      />
      <LandingInmobiliarias />
    </>
  );
}
