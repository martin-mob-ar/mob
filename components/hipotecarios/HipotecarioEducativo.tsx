import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ClipboardCheck,
  Scale,
  Landmark,
  ShieldCheck,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function HipotecarioEducativo() {
  return (
    <section className="space-y-16 mt-16">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center">
        Todo sobre préstamos hipotecarios en Argentina
      </h2>

      {/* 1. Qué es */}
      <Block
        icon={<Landmark className="h-6 w-6 text-primary" />}
        title="¿Qué es un crédito hipotecario y cómo funciona?"
      >
        <p className="text-muted-foreground leading-relaxed">
          Un préstamo hipotecario es una línea de financiamiento a largo plazo
          diseñada para la adquisición, construcción o refacción de inmuebles.
          La entidad bancaria desembolsa un capital que el solicitante devuelve
          en cuotas mensuales durante un período que puede extenderse de 5 a 30
          años, según las condiciones crediticias de cada banco argentino.
          Durante la vigencia del crédito, la propiedad queda como garantía
          hipotecaria: si se interrumpen los pagos, el banco tiene derecho a
          ejecutar el bien para recuperar el saldo pendiente. Es el instrumento
          de financiación de vivienda más utilizado tanto en bancos públicos
          como privados del país.
        </p>
      </Block>

      {/* 2. Pros y consideraciones */}
      <Block
        icon={<Scale className="h-6 w-6 text-primary" />}
        title="Ventajas y puntos clave de los créditos hipotecarios"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">
              Beneficios de financiar tu vivienda
            </h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                Accedés a una propiedad sin necesidad de reunir el valor total: el banco financia entre el 60 % y el 90 % del monto de tasación.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                Plazos extensos (hasta 30 años) que permiten cuotas hipotecarias más accesibles respecto a otros productos financieros.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                Las tasas hipotecarias suelen ser significativamente menores que las de préstamos personales o de consumo.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                En ciertos regímenes, los intereses pagados pueden tener beneficios fiscales.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">
              Aspectos a evaluar antes de solicitar
            </h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                Costos adicionales al monto financiado: escrituración, tasación bancaria, seguros obligatorios y sellados provinciales.
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                La tasación del banco puede diferir del precio de venta pactado con el vendedor, afectando la relación monto/tasación final.
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                Es obligatorio mantener un seguro de vida deudor y un seguro de incendio durante toda la vida del préstamo hipotecario.
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                En la modalidad UVA, la cuota hipotecaria se ajusta según la inflación, lo que puede generar variaciones significativas en el importe mensual.
              </li>
            </ul>
          </div>
        </div>
      </Block>

      {/* 3. Requisitos */}
      <Block
        icon={<ClipboardCheck className="h-6 w-6 text-primary" />}
        title="Requisitos habituales para acceder a un préstamo hipotecario"
      >
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <RequisitoItem
            title="Capacidad de repago comprobable"
            desc="Los bancos argentinos exigen ingresos demostrables —mediante recibos de sueldo, certificaciones o declaraciones juradas— que representen al menos 3 a 4 veces la cuota hipotecaria estimada."
          />
          <RequisitoItem
            title="Perfil crediticio favorable"
            desc="Historial sin mora activa en la Central de Deudores del BCRA. Algunas entidades requieren no figurar en registros de situación irregular durante los últimos 12 a 24 meses."
          />
          <RequisitoItem
            title="Antigüedad laboral o actividad comercial"
            desc="Para empleados en relación de dependencia, entre 6 y 12 meses continuos. Para autónomos o monotributistas, la mayoría de las líneas pide entre 1 y 2 años de antigüedad demostrable."
          />
          <RequisitoItem
            title="Ahorro inicial para el anticipo"
            desc="Como la mayoría de los préstamos financia entre el 60 % y el 90 % del valor de tasación, necesitás contar con fondos propios para cubrir la diferencia más los gastos asociados a la operación."
          />
        </div>
      </Block>

      {/* 4. UVA vs Pesos */}
      <div>
        <h3 className="font-display text-xl font-semibold text-foreground text-center mb-6">
          Crédito hipotecario UVA vs. crédito en pesos: ¿cuál conviene?
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <CompareCard
            title="Préstamo hipotecario UVA"
            color="primary"
            items={[
              "La cuota se actualiza según la variación del índice UVA, vinculado al CER y la inflación oficial del INDEC.",
              "Permite acceder a una cuota inicial notablemente menor, facilitando la calificación crediticia.",
              "Riesgo inherente: en períodos de alta inflación, la cuota hipotecaria puede crecer por encima de los ingresos.",
              "Mayor disponibilidad de líneas en bancos públicos y privados, con montos financiables más elevados.",
            ]}
          />
          <CompareCard
            title="Préstamo hipotecario en pesos"
            color="amber"
            items={[
              "Mayor previsibilidad nominal en la cuota, aunque puede incluir tasa variable con ajuste periódico.",
              "La cuota inicial suele ser más alta que la de un crédito UVA por el mismo monto financiado.",
              "Menor cantidad de líneas disponibles y, frecuentemente, topes de financiación más reducidos.",
              "Puede resultar conveniente para quienes priorizan estabilidad en el valor nominal de cada desembolso mensual.",
            ]}
          />
        </div>
      </div>

      {/* 5. Pasos */}
      <Block
        icon={<ArrowRight className="h-6 w-6 text-primary" />}
        title="Paso a paso: cómo tramitar un crédito hipotecario"
      >
        <div className="space-y-6">
          <StepItem
            step={1}
            title="Evaluá tu situación financiera"
            desc="Reuní tus recibos de sueldo, consultá tu situación en la Central de Deudores del BCRA y estimá cuánto podés destinar mensualmente a la cuota hipotecaria. Esta autoevaluación te dará una primera medida de viabilidad."
          />
          <StepItem
            step={2}
            title="Solicitá la precalificación bancaria"
            desc="Acercate a la sucursal o completá la solicitud online. El banco analiza ingresos, perfil crediticio y capacidad de pago para emitir un monto tentativo de financiación y las condiciones crediticias preliminares."
          />
          <StepItem
            step={3}
            title="Elegí el inmueble y esperá la tasación"
            desc="Con la precalificación aprobada, buscá la propiedad. La entidad enviará un tasador matriculado para verificar el valor de mercado, las condiciones edilicias y la relación monto/tasación (LTV) aplicable."
          />
          <StepItem
            step={4}
            title="Aprobación definitiva, escritura y desembolso"
            desc="Si la tasación, la documentación y los seguros están en orden, el banco libera los fondos. Se firma la escritura traslativa de dominio y se inscribe la hipoteca en el Registro de la Propiedad."
          />
        </div>
      </Block>

      {/* 6. Plazos orientativos */}
      <Block
        icon={<ShieldCheck className="h-6 w-6 text-primary" />}
        title="¿Cuánto tarda el trámite de un préstamo hipotecario?"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 text-muted-foreground font-medium">Etapa del trámite</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Plazo estimado</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/10">
                <td className="py-2">Precalificación y análisis del perfil crediticio</td>
                <td className="text-right py-2">5 a 15 días hábiles</td>
              </tr>
              <tr className="border-b border-border/10">
                <td className="py-2">Tasación del inmueble por perito bancario</td>
                <td className="text-right py-2">7 a 20 días hábiles</td>
              </tr>
              <tr className="border-b border-border/10">
                <td className="py-2">Aprobación definitiva y armado de carpeta</td>
                <td className="text-right py-2">10 a 30 días hábiles</td>
              </tr>
              <tr>
                <td className="py-2">Escrituración y desembolso del crédito</td>
                <td className="text-right py-2">15 a 45 días hábiles</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-3">
          *Los plazos son orientativos y dependen de la entidad bancaria, la documentación presentada y la complejidad de cada operación.
        </p>
      </Block>

      {/* 7. FAQs */}
      <div>
        <h3 className="font-display text-xl font-semibold text-foreground text-center mb-6">
          Preguntas frecuentes sobre créditos hipotecarios en Argentina
        </h3>
        <Accordion type="single" collapsible className="space-y-2">
          <FaqItem
            value="1"
            question="¿Cuánto dinero necesito ahorrar para el anticipo de un préstamo hipotecario?"
            answer="Depende de la relación monto/tasación (LTV) que ofrezca cada banco. La mayoría de las entidades argentinas financian entre el 60 % y el 90 % del valor de tasación. Eso significa que necesitás reunir entre el 10 % y el 40 % del valor como aporte propio, más los gastos de escrituración, sellados y seguros obligatorios."
          />
          <FaqItem
            value="2"
            question="¿Qué documentación me van a pedir para un crédito hipotecario?"
            answer="Los requisitos varían según el banco, pero en general solicitan: DNI vigente, constancia de CUIL/CUIT, los últimos 3 a 6 recibos de sueldo o certificación de ingresos para autónomos, declaraciones juradas de ganancias y bienes personales si corresponde, y un comprobante de domicilio actualizado. Algunas entidades piden documentación adicional según el perfil crediticio."
          />
          <FaqItem
            value="3"
            question="¿Qué pasa si no puedo pagar alguna cuota del crédito hipotecario?"
            answer="Ante un atraso, la entidad aplica intereses punitorios sobre los días de mora. Si la situación se extiende sin resolverse, el banco puede iniciar un proceso de ejecución hipotecaria sobre el inmueble. Lo más aconsejable es contactar a la entidad apenas se prevea una dificultad para evaluar opciones como la reprogramación de pagos."
          />
          <FaqItem
            value="4"
            question="¿Puedo cancelar anticipadamente un préstamo hipotecario sin penalidades?"
            answer="Sí. La normativa argentina vigente establece que los tomadores de créditos hipotecarios pueden realizar cancelaciones totales o parciales anticipadas sin penalización en la mayoría de los casos. De todos modos, es recomendable verificar las cláusulas específicas de tu contrato con el banco."
          />
          <FaqItem
            value="5"
            question="¿Qué seguros son obligatorios al contratar un crédito hipotecario?"
            answer="Como mínimo, las entidades exigen un seguro de vida que cubra el saldo deudor (para proteger a los herederos y al banco) y un seguro de incendio sobre el inmueble hipotecado. Algunos bancos también requieren cobertura contra catástrofes naturales o seguros integrales de hogar."
          />
          <FaqItem
            value="6"
            question="¿Existen créditos hipotecarios para refacción, ampliación o construcción?"
            answer="Sí. Varios bancos argentinos ofrecen líneas específicas destinadas a mejoras edilicias, ampliación de vivienda existente o construcción sobre terreno propio. Generalmente, estos préstamos tienen montos financiables menores y plazos más cortos que los de adquisición de primera vivienda."
          />
          <FaqItem
            value="7"
            question="¿Cuál es la diferencia entre TNA y CFT en un crédito hipotecario?"
            answer="La TNA (Tasa Nominal Anual) refleja únicamente el costo del interés puro del préstamo. El CFT (Costo Financiero Total) incorpora, además, los seguros obligatorios, gastos administrativos y comisiones de la entidad. El CFT siempre es más alto que la TNA y es el indicador más representativo para comparar créditos hipotecarios entre distintos bancos."
          />
          <FaqItem
            value="8"
            question="¿Qué significa la relación monto/tasación (LTV) en un préstamo hipotecario?"
            answer="El LTV (Loan to Value) indica qué porcentaje del valor de tasación del inmueble puede cubrir el banco con el financiamiento. Por ejemplo, un LTV del 75 % significa que la entidad presta hasta el 75 % del valor tasado y el solicitante debe aportar el 25 % restante con fondos propios."
          />
          <FaqItem
            value="9"
            question="¿Las condiciones de los créditos hipotecarios que se muestran son definitivas?"
            answer="No. La información publicada es orientativa y está sujeta a cambios según las políticas comerciales de cada banco, la fecha de consulta y el perfil del solicitante. Antes de tomar cualquier decisión de financiación, es imprescindible confirmar las condiciones vigentes directamente con la entidad bancaria."
          />
          <FaqItem
            value="10"
            question="¿Cómo afecta la inflación a un crédito hipotecario UVA?"
            answer="En un préstamo UVA, la cuota mensual se recalcula en función del índice UVA publicado por el BCRA, que refleja la variación del CER (inflación). Si la inflación sube, la cuota hipotecaria acompaña ese movimiento. Por eso es fundamental proyectar distintos escenarios de inflación antes de optar por esta modalidad y evaluar si tus ingresos podrían absorber esos incrementos."
          />
        </Accordion>
      </div>

      {/* 8. Tips */}
      <div>
        <h3 className="font-display text-xl font-semibold text-foreground text-center mb-6">
          Consejos prácticos para tu crédito hipotecario
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <TipBlock
            icon={<Lightbulb className="h-5 w-5" />}
            title="Antes de solicitar el préstamo"
            tips={[
              "Consultá tu situación en la Central de Deudores del BCRA y regularizá cualquier deuda pendiente.",
              "Compará las condiciones crediticias de al menos 3 bancos argentinos antes de iniciar el trámite.",
              "Estimá todos los costos adicionales al monto financiado: escribanía, tasación, impuestos y sellados.",
              "Asegurate de contar con el ahorro inicial más un margen de reserva para imprevistos.",
            ]}
          />
          <TipBlock
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="Durante la gestión del crédito"
            tips={[
              "Mantené al día toda la documentación para agilizar los tiempos de aprobación.",
              "Pedí que te informen el CFT (Costo Financiero Total), no solo la TNA, para entender el costo real del préstamo.",
              "Si optás por un hipotecario UVA, simulá escenarios con distintos niveles de inflación para medir el riesgo.",
              "Leé con detenimiento las cláusulas de cancelación anticipada, mora y ajuste de tasa antes de firmar.",
            ]}
          />
          <TipBlock
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Después de obtener la aprobación"
            tips={[
              "Activá el débito automático de la cuota hipotecaria para evitar olvidos e intereses punitorios.",
              "Guardá toda la documentación del crédito —contrato, pólizas, escritura— en un lugar seguro y accesible.",
              "Si tu préstamo es UVA, monitoreá periódicamente la evolución de la cuota y del índice.",
              "Evaluá la cancelación parcial o total anticipada si recibís ingresos extraordinarios.",
            ]}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center border-t border-border/20 pt-8">
        <p className="text-xs text-muted-foreground/50 max-w-2xl mx-auto leading-relaxed">
          La información presentada en esta página es de carácter orientativo y
          puede modificarse sin previo aviso. Las tasas hipotecarias,
          condiciones crediticias y requisitos vigentes deben confirmarse
          directamente con cada entidad bancaria antes de iniciar cualquier
          trámite de financiación de vivienda.
        </p>
      </div>
    </section>
  );
}

function Block({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/20 bg-card/40 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        {icon}
        <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function RequisitoItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-background/30 border border-border/10 p-4">
      <h5 className="font-medium text-foreground text-sm mb-1">{title}</h5>
      <p className="text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function CompareCard({
  title,
  color,
  items,
}: {
  title: string;
  color: "primary" | "amber";
  items: string[];
}) {
  const borderColor =
    color === "primary" ? "border-primary/30" : "border-amber-500/30";
  const textColor =
    color === "primary" ? "text-primary" : "text-amber-400";

  return (
    <div className={`rounded-2xl border ${borderColor} bg-card/40 p-6`}>
      <h4 className={`font-display font-bold ${textColor} mb-4`}>{title}</h4>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={`${textColor} mt-1`}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepItem({
  step,
  title,
  desc,
}: {
  step: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary font-display font-bold text-sm shrink-0">
        {step}
      </div>
      <div>
        <h4 className="font-display font-semibold text-foreground text-sm mb-1">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({
  value,
  question,
  answer,
}: {
  value: string;
  question: string;
  answer: string;
}) {
  return (
    <AccordionItem
      value={value}
      className="border border-border/20 rounded-xl px-4 bg-card/30"
    >
      <AccordionTrigger className="text-sm text-foreground hover:no-underline">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}

function TipBlock({
  icon,
  title,
  tips,
}: {
  icon: React.ReactNode;
  title: string;
  tips: string[];
}) {
  return (
    <div className="rounded-2xl border border-border/20 bg-card/40 p-5">
      <div className="flex items-center gap-2 mb-4 text-primary">
        {icon}
        <h4 className="font-display font-semibold text-foreground text-sm">
          {title}
        </h4>
      </div>
      <ul className="space-y-2 text-xs text-muted-foreground">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2">
            <CheckCircle2 className="h-3 w-3 text-primary/60 shrink-0 mt-0.5" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
