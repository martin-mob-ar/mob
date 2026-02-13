import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bug, ChevronDown, ChevronUp } from "lucide-react";
import { fetchIPCData, parseMonthLabel } from "@/services/ipcService";

interface RawDataPoint {
  month: string;
  label: string;
  rate: number;
}

interface DebugResult {
  data: RawDataPoint[];
  usedSample: boolean;
  missingMonths: string[];
}

export default function IPCDebugPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchIPCData("2020-01", "2025-12");
      setResult({
        data: res.data.map((d) => ({
          month: d.month,
          label: parseMonthLabel(d.month),
          rate: d.rate,
        })),
        usedSample: res.usedSample,
        missingMonths: res.missingMonths,
      });
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mt-8">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && !result && !loading) handleFetch();
        }}
        className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bug className="h-4 w-4" />
        <span>Modo dev — ver datos crudos de la API</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <Card className="mt-3 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center justify-between">
              <span>Datos IPC (2020–2025)</span>
              <div className="flex items-center gap-2">
                {result && (
                  <span className={`text-xs px-2 py-0.5 rounded ${result.usedSample ? "bg-warning/20 text-warning" : "bg-green-500/20 text-green-700"}`}>
                    {result.usedSample ? "⚠ Datos de fallback (sample)" : "✓ Datos de API"}
                  </span>
                )}
                <Button size="sm" variant="outline" onClick={handleFetch} disabled={loading} className="text-xs h-7">
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Recargar"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive font-mono bg-destructive/10 p-3 rounded">
                Error: {error}
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                {result.missingMonths.length > 0 && (
                  <div className="text-xs font-mono bg-warning/10 p-2 rounded text-warning">
                    Meses faltantes: {result.missingMonths.join(", ")}
                  </div>
                )}

                <div className="text-xs text-muted-foreground font-mono mb-1">
                  Total: {result.data.length} meses cargados
                </div>

                <div className="max-h-96 overflow-y-auto border rounded">
                  <table className="w-full text-xs font-mono">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="text-left p-2 border-b">month (key)</th>
                        <th className="text-left p-2 border-b">label</th>
                        <th className="text-right p-2 border-b">rate (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.map((d) => (
                        <tr key={d.month} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-2 text-muted-foreground">{d.month}</td>
                          <td className="p-2">{d.label}</td>
                          <td className="p-2 text-right font-semibold">{d.rate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
