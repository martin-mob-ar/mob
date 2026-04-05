import type { Metadata } from "next";
import CalculadoraIPC from "@/views/CalculadoraIPC";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FAQJsonLd from "@/components/seo/FAQJsonLd";
import HowToJsonLd from "@/components/seo/HowToJsonLd";

export const metadata: Metadata = {
  title: "Calculadora IPC - Calcula el ajuste de tu alquiler",
  description:
    "Calcula el ajuste de tu alquiler segun el indice IPC del INDEC. Herramienta gratuita para inquilinos y propietarios en Argentina.",
  alternates: { canonical: "/calculadora-ipc" },
};

export default function CalculadoraIPCPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Calculadora IPC", href: "/calculadora-ipc" },
        ]}
      />
      <FAQJsonLd
        items={[
          { question: "¿Qué es el IPC para alquileres y quién lo calcula?", answer: "El IPC (Índice de Precios al Consumidor) es una medición estadística que elabora el INDEC todos los meses. Mide la variación promedio de precios de una canasta representativa de bienes y servicios. Es el índice oficial que se usa como referencia en los contratos de alquiler ajustados por inflación en Argentina." },
          { question: "¿Cómo se calcula el aumento de alquiler por IPC?", answer: "Se toman las tasas de inflación IPC de cada mes comprendido entre tu último ajuste y el nuevo, y se multiplican entre sí. El resultado es un factor de actualización que, aplicado a tu alquiler vigente, te da el nuevo valor. Por ejemplo, si tus tasas mensuales fueron 2%, 3% y 1,5%, el factor sería 1,02 × 1,03 × 1,015 = 1,0666, es decir un aumento del 6,66%." },
          { question: "¿Funciona con ajustes de alquiler IPC cada 3, 6 o 12 meses?", answer: "Sí. Podés simular un ajuste de alquiler trimestral IPC (cada 3 meses), semestral (cada 6 meses) o anual (cada 12 meses). La calculadora genera automáticamente las fechas de ajuste y aplica las tasas correspondientes a cada período según la frecuencia que elijas." },
          { question: "¿Cómo funciona el IPC en contratos de alquiler?", answer: "La cláusula IPC en un contrato de alquiler establece que el monto se actualice periódicamente usando la inflación oficial. Se define una frecuencia de ajuste (trimestral, cuatrimestral, semestral o anual) y, en cada fecha de actualización, se aplica la variación acumulada del IPC entre las dos fechas. Esto se conoce como indexación de alquileres por IPC." },
          { question: "¿Qué pasa si el dato del IPC mensual todavía no salió?", answer: "El INDEC suele publicar el IPC con un retraso de unas semanas. Si elegís un mes cuyo dato aún no fue publicado, la herramienta te va a avisar que no está disponible. En ese caso, podés probar con el mes anterior o esperar a que se publique el dato oficial." },
          { question: "¿Es posible que el alquiler baje con la actualización por IPC?", answer: "Técnicamente sí. Si la inflación fuera negativa (deflación), el factor de ajuste sería menor a 1 y el alquiler resultaría más bajo. En la práctica, esto rara vez ocurre en Argentina. Lo que manda siempre es lo que dice tu contrato de alquiler." },
          { question: "¿Por qué el resultado puede diferir de otras calculadoras de alquiler IPC?", answer: "Hay diferencias sutiles en cómo cada herramienta interpreta las fechas, el redondeo y la fuente del dato. Algunas calculadoras usan variantes regionales del IPC en vez del nivel general. Además, el momento exacto de corte del mes puede generar diferencias. Esta calculadora de alquiler IPC usa datos nivel general y te muestra exactamente qué meses tomó para que puedas verificar." },
          { question: "Mi contrato dice \"ajuste al mes vencido\", ¿qué fecha uso?", answer: "Eso depende de cómo esté redactada la cláusula IPC de tu contrato. \"Al mes vencido\" generalmente significa que se toma el IPC del mes que ya terminó. Si tu ajuste es en junio, probablemente se use el dato de mayo. Revisá tu contrato de alquiler o consultá con un profesional para estar seguro." },
          { question: "¿Cuánto aumenta el alquiler con IPC en Argentina?", answer: "Depende del período y la frecuencia de ajuste. Por ejemplo, un alquiler IPC cada 3 meses acumula la inflación trimestral, mientras que uno anual refleja los 12 meses de variación punta a punta. Usá esta calculadora de alquiler por IPC para ver exactamente cuánto te corresponde según tus fechas." },
          { question: "¿Este resultado es lo que tengo que pagar sí o sí?", answer: "No necesariamente. Esta herramienta te da una estimación orientativa del valor actualizado del alquiler. Lo que realmente define el monto es la cláusula de ajuste de tu contrato. Puede haber diferencias por redondeo o por acuerdos particulares entre las partes. Siempre verificá contra tu contrato." },
          { question: "¿Puedo usar esta herramienta para otros acuerdos ajustados por inflación?", answer: "¡Sí! Si bien está pensada para la readecuación del alquiler por IPC, la fórmula es la misma para cualquier acuerdo que use la inflación aplicada al alquiler u otros contratos: cuotas, servicios, honorarios, etc. Solo ingresá el monto vigente y las fechas correspondientes." },
          { question: "¿Cuál es la diferencia entre IPC e ICL para alquileres?", answer: "El IPC mide la variación de precios al consumidor y se usa en los contratos actuales. El ICL (Índice para Contratos de Locación) era un índice combinado de IPC y salarios (RIPTE) que se usaba con la ley de alquileres anterior. Actualmente, la mayoría de los nuevos contratos usan ajuste por IPC. Si tu contrato usa ICL, esta calculadora no aplica directamente." },
          { question: "¿Desde qué fecha hay datos de IPC disponibles?", answer: "Esta herramienta cuenta con datos del índice IPC alquiler a partir de enero de 2020. Si necesitás calcular ajustes para fechas anteriores, vas a tener que buscar los valores de IPC manualmente en las publicaciones del INDEC en indec.gob.ar." },
        ]}
      />
      <HowToJsonLd
        name="Cómo calcular un ajuste de alquiler por IPC"
        description="Guía paso a paso para calcular el ajuste de tu alquiler usando el índice IPC del INDEC."
        steps={[
          { name: "Ingresá tu alquiler", text: "Cargá el monto actual de tu alquiler y la fecha de inicio del contrato." },
          { name: "Elegí la frecuencia", text: "Seleccioná si tu ajuste de alquiler por IPC es trimestral, semestral o anual según tu contrato." },
          { name: "Calculá el aumento", text: "La calculadora aplica la inflación IPC mes a mes usando los datos oficiales del INDEC." },
          { name: "Revisá el resultado", text: "Vas a ver cada ajuste con el detalle de tasas mensuales aplicadas, la variación acumulada y la evolución del alquiler." },
        ]}
      />
      <CalculadoraIPC />
    </>
  );
}
