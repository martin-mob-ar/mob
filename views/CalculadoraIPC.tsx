import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import SimulacionContrato from "@/components/ipc/SimulacionContrato";
import IPCInfoSections from "@/components/ipc/IPCInfoSections";
import { getLastAvailableMonth, parseMonthLabel, formatRate, getMonthKey, monthBefore, fetchIPCData } from "@/services/ipcService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function CalculadoraIPC() {
  const fallback = getLastAvailableMonth();
  const [lastMonth, setLastMonth] = useState(fallback.month);
  const [lastRate, setLastRate] = useState<number | null>(null);
  const [loadingLast, setLoadingLast] = useState(true);
  useEffect(() => {
    document.title = "Calculadora de Alquiler por IPC Argentina – Ajustes cada 3, 6 o 12 meses";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Calculá el ajuste de alquiler por IPC en Argentina con datos oficiales del INDEC. Simulá aumentos trimestrales, semestrales o anuales y conocé cuánto aumenta tu alquiler con inflación.");
  }, []);
  useEffect(() => {
    async function fetchLast() {
      try {
        const now = new Date();
        const currentMonth = getMonthKey(now);
        const twoMonthsAgo = monthBefore(monthBefore(currentMonth));
        const result = await fetchIPCData(twoMonthsAgo, currentMonth);
        if (result.data.length > 0) {
          const last = result.data[result.data.length - 1];
          setLastMonth(last.month);
          setLastRate(last.rate);
        } else {
          setLastRate(fallback.rate);
        }
      } catch {
        setLastRate(fallback.rate);
      } finally {
        setLoadingLast(false);
      }
    }
    fetchLast();
  }, []);
  return <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-accent/50 to-background py-10 sm:py-[30px]">
          <div className="container max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3">
              Calculadora de alquiler con IPC oficial
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 max-w-2xl mx-auto">
              Calculá el ajuste de alquiler por IPC en Argentina. Simulá aumentos cada 3, 6 o 12 meses con el índice oficial que publica el INDEC.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm">
              <span className="text-muted-foreground">Último IPC mensual:</span>
              {loadingLast ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="inline-flex items-center gap-1.5">
                  <span className="font-semibold">{parseMonthLabel(lastMonth)}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-semibold text-primary">{lastRate !== null ? formatRate(lastRate) : "—"}</span>
                </span>}
            </div>
          </div>
        </section>

        <section className="container max-w-3xl pt-4 sm:pt-6 pb-8 sm:pb-12">
          <SimulacionContrato />
          <IPCInfoSections />
        </section>
      </main>
      <Footer />
    </div>;
}