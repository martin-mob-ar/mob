import type { Metadata } from "next";
import LandingPropietarios from "@/views/LandingPropietarios";
import FAQJsonLd from "@/components/seo/FAQJsonLd";

export const metadata: Metadata = {
  title: "Propietarios - Publica tu propiedad y alquila online",
  description:
    "Publica tu propiedad en Mob y alquila de forma segura. Verificacion de inquilinos, contratos digitales, cobro automatico y garantia con descuento.",
  alternates: { canonical: "/propietarios" },
};

export default function PropietariosPage() {
  return (
    <>
      <FAQJsonLd
        items={[
          { question: "¿Cuánto cuesta publicar mi propiedad?", answer: "Publicar es gratis. Solo cobramos por el costo de la plataforma cuando el alquiler se concreta. Sin costos iniciales ni sorpresas." },
          { question: "¿Cómo verifican a los inquilinos?", answer: "Validamos identidad, antecedentes penales, situación financiera y capacidad de pago antes de que el interesado pueda avanzar." },
          { question: "¿Qué pasa si el inquilino no paga?", answer: "Con el respaldo de Hoggax, tu alquiler está garantizado. Si el inquilino se atrasa, vos cobrás igual." },
          { question: "¿Tengo que hacer algo durante el proceso?", answer: "Solo publicás tu propiedad y confirmás al inquilino. El resto: coordinación de visitas, documentación, pago y contrato lo gestionamos nosotros." },
        ]}
      />
      <LandingPropietarios />
    </>
  );
}
