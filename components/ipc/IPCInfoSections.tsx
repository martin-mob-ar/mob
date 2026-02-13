import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, BookOpen, HelpCircle } from "lucide-react";
import IPCChart2025 from "./IPCChart2025";

export default function IPCInfoSections() {
  return (
    <div className="space-y-10 mt-12">
      {/* Guía rápida */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold font-display">Cómo calcular un ajuste de alquiler por IPC</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Ingresá tu alquiler", desc: "Cargá el monto actual de tu alquiler y la fecha de inicio del contrato." },
            { step: "2", title: "Elegí la frecuencia", desc: "Seleccioná si tu ajuste de alquiler por IPC es trimestral, semestral o anual según tu contrato." },
            { step: "3", title: "Calculá el aumento", desc: "La calculadora aplica la inflación IPC mes a mes usando los datos oficiales del INDEC." },
            { step: "4", title: "Revisá el resultado", desc: "Vas a ver cada ajuste con el detalle de tasas mensuales aplicadas, la variación acumulada y la evolución del alquiler." },
          ].map((item) => (
            <Card key={item.step} className="p-5">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold font-display mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ¿Qué es el IPC? */}
      <section className="max-w-3xl">
        <h2 className="text-xl font-bold font-display mb-3">¿Qué es el IPC y cómo se aplica a los alquileres?</h2>
        <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
          <p>
            El <strong>Índice de Precios al Consumidor (IPC)</strong> es el indicador oficial de inflación que publica el INDEC todos los meses en Argentina. Refleja cuánto subieron los precios de una canasta de bienes y servicios respecto del mes anterior.
          </p>
          <p>
            En los contratos de alquiler vigentes, la <strong>cláusula IPC</strong> establece que el monto se actualice periódicamente usando este índice. El cálculo de alquiler actualizado se hace multiplicando el valor vigente por el factor de inflación acumulada entre los meses que corresponden. Así, el <strong>alquiler ajustado por IPC</strong> refleja la variación real de precios del período.
          </p>
          <p>
            Este <strong>simulador de alquiler IPC</strong> automatiza esa cuenta: toma las tasas mensuales oficiales y compone el aumento, ya sea para un ajuste de alquiler trimestral, semestral o anual. Solo necesitás ingresar tu monto y las fechas.
          </p>
        </div>
        <IPCChart2025 />
      </section>

      {/* FAQs */}
      <section className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold font-display">Preguntas frecuentes sobre IPC y alquileres</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger>¿Qué es el IPC para alquileres y quién lo calcula?</AccordionTrigger>
            <AccordionContent>
              El IPC (Índice de Precios al Consumidor) es una medición estadística que elabora el INDEC todos los meses. Mide la variación promedio de precios de una canasta representativa de bienes y servicios. Es el índice oficial que se usa como referencia en los contratos de alquiler ajustados por inflación en Argentina.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>¿Cómo se calcula el aumento de alquiler por IPC?</AccordionTrigger>
            <AccordionContent>
              Se toman las tasas de inflación IPC de cada mes comprendido entre tu último ajuste y el nuevo, y se multiplican entre sí. El resultado es un factor de actualización que, aplicado a tu alquiler vigente, te da el nuevo valor. Por ejemplo, si tus tasas mensuales fueron 2%, 3% y 1,5%, el factor sería 1,02 × 1,03 × 1,015 = 1,0666, es decir un aumento del 6,66%.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>¿Funciona con ajustes de alquiler IPC cada 3, 6 o 12 meses?</AccordionTrigger>
            <AccordionContent>
              Sí. Podés simular un ajuste de alquiler trimestral IPC (cada 3 meses), semestral (cada 6 meses) o anual (cada 12 meses). La calculadora genera automáticamente las fechas de ajuste y aplica las tasas correspondientes a cada período según la frecuencia que elijas.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4">
            <AccordionTrigger>¿Cómo funciona el IPC en contratos de alquiler?</AccordionTrigger>
            <AccordionContent>
              La cláusula IPC en un contrato de alquiler establece que el monto se actualice periódicamente usando la inflación oficial. Se define una frecuencia de ajuste (trimestral, cuatrimestral, semestral o anual) y, en cada fecha de actualización, se aplica la variación acumulada del IPC entre las dos fechas. Esto se conoce como indexación de alquileres por IPC.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q5">
            <AccordionTrigger>¿Qué pasa si el dato del IPC mensual todavía no salió?</AccordionTrigger>
            <AccordionContent>
              El INDEC suele publicar el IPC con un retraso de unas semanas. Si elegís un mes cuyo dato aún no fue publicado, la herramienta te va a avisar que no está disponible. En ese caso, podés probar con el mes anterior o esperar a que se publique el dato oficial.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q6">
            <AccordionTrigger>¿Es posible que el alquiler baje con la actualización por IPC?</AccordionTrigger>
            <AccordionContent>
              Técnicamente sí. Si la inflación fuera negativa (deflación), el factor de ajuste sería menor a 1 y el alquiler resultaría más bajo. En la práctica, esto rara vez ocurre en Argentina. Lo que manda siempre es lo que dice tu contrato de alquiler.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q7">
            <AccordionTrigger>¿Por qué el resultado puede diferir de otras calculadoras de alquiler IPC?</AccordionTrigger>
            <AccordionContent>
              Hay diferencias sutiles en cómo cada herramienta interpreta las fechas, el redondeo y la fuente del dato. Algunas calculadoras usan variantes regionales del IPC en vez del nivel general. Además, el momento exacto de corte del mes puede generar diferencias. Esta calculadora de alquiler IPC usa datos nivel general y te muestra exactamente qué meses tomó para que puedas verificar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q8">
            <AccordionTrigger>Mi contrato dice "ajuste al mes vencido", ¿qué fecha uso?</AccordionTrigger>
            <AccordionContent>
              Eso depende de cómo esté redactada la cláusula IPC de tu contrato. "Al mes vencido" generalmente significa que se toma el IPC del mes que ya terminó. Si tu ajuste es en junio, probablemente se use el dato de mayo. Revisá tu contrato de alquiler o consultá con un profesional para estar seguro.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q9">
            <AccordionTrigger>¿Cuánto aumenta el alquiler con IPC en Argentina?</AccordionTrigger>
            <AccordionContent>
              Depende del período y la frecuencia de ajuste. Por ejemplo, un alquiler IPC cada 3 meses acumula la inflación trimestral, mientras que uno anual refleja los 12 meses de variación punta a punta. Usá esta calculadora de alquiler por IPC para ver exactamente cuánto te corresponde según tus fechas.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q10">
            <AccordionTrigger>¿Este resultado es lo que tengo que pagar sí o sí?</AccordionTrigger>
            <AccordionContent>
              No necesariamente. Esta herramienta te da una estimación orientativa del valor actualizado del alquiler. Lo que realmente define el monto es la cláusula de ajuste de tu contrato. Puede haber diferencias por redondeo o por acuerdos particulares entre las partes. Siempre verificá contra tu contrato.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q11">
            <AccordionTrigger>¿Puedo usar esta herramienta para otros acuerdos ajustados por inflación?</AccordionTrigger>
            <AccordionContent>
              ¡Sí! Si bien está pensada para la readecuación del alquiler por IPC, la fórmula es la misma para cualquier acuerdo que use la inflación aplicada al alquiler u otros contratos: cuotas, servicios, honorarios, etc. Solo ingresá el monto vigente y las fechas correspondientes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q12">
            <AccordionTrigger>¿Cuál es la diferencia entre IPC e ICL para alquileres?</AccordionTrigger>
            <AccordionContent>
              El IPC mide la variación de precios al consumidor y se usa en los contratos actuales. El ICL (Índice para Contratos de Locación) era un índice combinado de IPC y salarios (RIPTE) que se usaba con la ley de alquileres anterior. Actualmente, la mayoría de los nuevos contratos usan ajuste por IPC. Si tu contrato usa ICL, esta calculadora no aplica directamente.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q13">
            <AccordionTrigger>¿Desde qué fecha hay datos de IPC disponibles?</AccordionTrigger>
            <AccordionContent>
              Esta herramienta cuenta con datos del índice IPC alquiler a partir de enero de 2020. Si necesitás calcular ajustes para fechas anteriores, vas a tener que buscar los valores de IPC manualmente en las publicaciones del INDEC en indec.gob.ar.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Disclaimer */}
      <section className="max-w-3xl">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">Aviso importante</p>
                <p>
                  Esta calculadora de alquiler por IPC es una herramienta orientativa que aplica la fórmula estándar de ajuste por inflación. Los resultados son estimaciones y <strong>no constituyen asesoramiento legal, contable ni financiero</strong>.
                </p>
                <p>
                  El valor real de tu alquiler ajustado por IPC depende exclusivamente de lo que establece tu contrato de alquiler. Cada acuerdo puede tener particularidades en cuanto al índice de referencia, la fecha de corte y otros aspectos que pueden hacer que el resultado difiera.
                </p>
                <p>
                  Si tenés dudas sobre tu contrato o sobre la actualización de alquiler por inflación que te corresponde, <strong>consultá con un abogado o profesional matriculado</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
