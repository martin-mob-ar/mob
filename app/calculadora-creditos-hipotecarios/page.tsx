import type { Metadata } from "next";
import CreditosHipotecarios from "@/views/CreditosHipotecarios";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FAQJsonLd from "@/components/seo/FAQJsonLd";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { supabaseAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Calculadora de creditos hipotecarios",
  description:
    "Simula tu credito hipotecario en Argentina. Calcula cuotas, tasa de interes y monto maximo segun tus ingresos. Herramienta gratuita de Mob.",
  alternates: { canonical: "/calculadora-creditos-hipotecarios" },
};

async function getExchangeRates() {
  const { data } = await supabaseAdmin
    .from("exchange_rates")
    .select("currency_pair, rate, updated_at")
    .in("currency_pair", ["USD_ARS", "UVA_ARS"]);

  const usd = data?.find((r) => r.currency_pair === "USD_ARS");
  const uva = data?.find((r) => r.currency_pair === "UVA_ARS");

  return {
    dolarVenta: usd ? Number(usd.rate) : null,
    dolarFecha: usd?.updated_at?.slice(0, 10) ?? null,
    uvaValor: uva ? Number(uva.rate) : null,
    uvaFecha: uva?.updated_at?.slice(0, 10) ?? null,
  };
}

export default async function CreditosHipotecariosPage() {
  const rates = await getExchangeRates();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Calculadora de creditos hipotecarios", href: "/calculadora-creditos-hipotecarios" },
        ]}
      />
      <FAQJsonLd
        items={[
          { question: "¿Cuánto dinero necesito ahorrar para el anticipo de un préstamo hipotecario?", answer: "Depende de la relación monto/tasación (LTV) que ofrezca cada banco. La mayoría de las entidades argentinas financian entre el 60 % y el 90 % del valor de tasación. Eso significa que necesitás reunir entre el 10 % y el 40 % del valor como aporte propio, más los gastos de escrituración, sellados y seguros obligatorios." },
          { question: "¿Qué documentación me van a pedir para un crédito hipotecario?", answer: "Los requisitos varían según el banco, pero en general solicitan: DNI vigente, constancia de CUIL/CUIT, los últimos 3 a 6 recibos de sueldo o certificación de ingresos para autónomos, declaraciones juradas de ganancias y bienes personales si corresponde, y un comprobante de domicilio actualizado." },
          { question: "¿Qué pasa si no puedo pagar alguna cuota del crédito hipotecario?", answer: "Ante un atraso, la entidad aplica intereses punitorios sobre los días de mora. Si la situación se extiende sin resolverse, el banco puede iniciar un proceso de ejecución hipotecaria sobre el inmueble. Lo más aconsejable es contactar a la entidad apenas se prevea una dificultad para evaluar opciones como la reprogramación de pagos." },
          { question: "¿Puedo cancelar anticipadamente un préstamo hipotecario sin penalidades?", answer: "Sí. La normativa argentina vigente establece que los tomadores de créditos hipotecarios pueden realizar cancelaciones totales o parciales anticipadas sin penalización en la mayoría de los casos. De todos modos, es recomendable verificar las cláusulas específicas de tu contrato con el banco." },
          { question: "¿Qué seguros son obligatorios al contratar un crédito hipotecario?", answer: "Como mínimo, las entidades exigen un seguro de vida que cubra el saldo deudor (para proteger a los herederos y al banco) y un seguro de incendio sobre el inmueble hipotecado. Algunos bancos también requieren cobertura contra catástrofes naturales o seguros integrales de hogar." },
          { question: "¿Existen créditos hipotecarios para refacción, ampliación o construcción?", answer: "Sí. Varios bancos argentinos ofrecen líneas específicas destinadas a mejoras edilicias, ampliación de vivienda existente o construcción sobre terreno propio. Generalmente, estos préstamos tienen montos financiables menores y plazos más cortos que los de adquisición de primera vivienda." },
          { question: "¿Cuál es la diferencia entre TNA y CFT en un crédito hipotecario?", answer: "La TNA (Tasa Nominal Anual) refleja únicamente el costo del interés puro del préstamo. El CFT (Costo Financiero Total) incorpora, además, los seguros obligatorios, gastos administrativos y comisiones de la entidad. El CFT siempre es más alto que la TNA y es el indicador más representativo para comparar créditos hipotecarios entre distintos bancos." },
          { question: "¿Qué significa la relación monto/tasación (LTV) en un préstamo hipotecario?", answer: "El LTV (Loan to Value) indica qué porcentaje del valor de tasación del inmueble puede cubrir el banco con el financiamiento. Por ejemplo, un LTV del 75 % significa que la entidad presta hasta el 75 % del valor tasado y el solicitante debe aportar el 25 % restante con fondos propios." },
          { question: "¿Las condiciones de los créditos hipotecarios que se muestran son definitivas?", answer: "No. La información publicada es orientativa y está sujeta a cambios según las políticas comerciales de cada banco, la fecha de consulta y el perfil del solicitante. Antes de tomar cualquier decisión de financiación, es imprescindible confirmar las condiciones vigentes directamente con la entidad bancaria." },
          { question: "¿Cómo afecta la inflación a un crédito hipotecario UVA?", answer: "En un préstamo UVA, la cuota mensual se recalcula en función del índice UVA publicado por el BCRA, que refleja la variación del CER (inflación). Si la inflación sube, la cuota hipotecaria acompaña ese movimiento. Por eso es fundamental proyectar distintos escenarios de inflación antes de optar por esta modalidad y evaluar si tus ingresos podrían absorber esos incrementos." },
        ]}
      />
      <HowToJsonLd
        name="Cómo tramitar un crédito hipotecario en Argentina"
        description="Paso a paso para solicitar y obtener un préstamo hipotecario en bancos argentinos."
        steps={[
          { name: "Evaluá tu situación financiera", text: "Reuní tus recibos de sueldo, consultá tu situación en la Central de Deudores del BCRA y estimá cuánto podés destinar mensualmente a la cuota hipotecaria." },
          { name: "Solicitá la precalificación bancaria", text: "Acercate a la sucursal o completá la solicitud online. El banco analiza ingresos, perfil crediticio y capacidad de pago para emitir un monto tentativo de financiación." },
          { name: "Elegí el inmueble y esperá la tasación", text: "Con la precalificación aprobada, buscá la propiedad. La entidad enviará un tasador matriculado para verificar el valor de mercado y las condiciones edilicias." },
          { name: "Aprobación definitiva, escritura y desembolso", text: "Si la tasación, la documentación y los seguros están en orden, el banco libera los fondos. Se firma la escritura traslativa de dominio y se inscribe la hipoteca." },
        ]}
      />
      <CreditosHipotecarios rates={rates} />
    </>
  );
}
