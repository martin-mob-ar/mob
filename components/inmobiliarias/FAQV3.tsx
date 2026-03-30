"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GarantiaTooltip } from "@/components/GarantiaTooltip";

const faqs = [
  {
    q: "¿Mob reemplaza a mi equipo comercial?",
    a: "No. Mob se encarga de la operación administrativa y de calificación. Tu equipo sigue siendo el vínculo comercial con el propietario y el inquilino.",
  },
  {
    q: "¿Qué pasa si mis consultas llegan por otros canales?",
    a: "Podés derivarlas al flujo de Mob fácilmente. No importa de dónde llegó el interesado.",
  },
  {
    q: "¿Cómo funciona la validación del interesado?",
    a: "Mob le envía un flujo por WhatsApp. El interesado valida su identidad con foto del DNI en menos de 1 minuto y sube su documentación sin fricciones.",
  },
  {
    q: "¿Cómo se integra la garantía?",
    a: <>Dentro del mismo flujo. Si el interesado necesita garantía, Mob le ofrece acceso a Hoggax con <GarantiaTooltip>50% de descuento</GarantiaTooltip>, sin salir del proceso.</>,
  },
  {
    q: "¿Puedo seguir usando Tokko?",
    a: "Sí. Mob se integra con Tokko para que no tengas que duplicar trabajo.",
  },
  {
    q: "¿Quién mantiene el control de la operación?",
    a: "Siempre vos. Mob ejecuta las validaciones y el flujo, pero la inmobiliaria tiene visibilidad completa en todo momento.",
  },
  {
    q: "¿Cómo funciona la firma del contrato?",
    a: "100% online. El interesado firma digitalmente desde su celular. Sin presencia física, sin papeles.",
  },
];

const FAQV3 = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <motion.h2
          className="font-display text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Preguntas frecuentes
        </motion.h2>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-xl px-5 bg-card data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQV3;
