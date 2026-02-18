import { useState, useEffect, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, TrendingUp, Hash, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  type SimulationResult,
  type IPCDataPoint,
  MIN_DATE,
  formatCurrencyARS,
  formatPercent,
  formatRate,
  formatDateArg,
  parseMonthShort,
  parseMonthLabel,
  getSimulationMonthRange,
  fetchIPCData,
  fetchAllIPCData,
  computeContractSimulation,
} from "@/services/ipcService";
import { useToast } from "@/hooks/use-toast";

export default function SimulacionContrato() {
  const { toast } = useToast();
  const [rent, setRent] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [frequency, setFrequency] = useState("3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [usedSample, setUsedSample] = useState(false);
  const [missingMonths, setMissingMonths] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [allIPCData, setAllIPCData] = useState<IPCDataPoint[]>([]);
  const [allIPCSource, setAllIPCSource] = useState<"api" | "sample" | "loading">("loading");

  // Load all IPC data on mount for the reference table
  useEffect(() => {
    fetchAllIPCData().then((res) => {
      setAllIPCData(res.data);
      setAllIPCSource(res.usedSample ? "sample" : "api");
    });
  }, []);

  const rentNumber = parseInt(rent.replace(/\D/g, ""), 10) || 0;

  const handleRentChange = (val: string) => {
    const raw = val.replace(/\D/g, "");
    if (!raw) { setRent(""); return; }
    setRent(parseInt(raw, 10).toLocaleString("es-AR"));
  };

  const handleCalculate = async () => {
    if (!rentNumber || rentNumber <= 0) {
      toast({ title: "Error", description: "Ingresá un monto de alquiler válido.", variant: "destructive" });
      return;
    }
    if (!startDate) {
      toast({ title: "Error", description: "Elegí una fecha de inicio.", variant: "destructive" });
      return;
    }
    if (startDate < MIN_DATE) {
      toast({ title: "Error", description: "Elegí una fecha desde 01/2020 en adelante.", variant: "destructive" });
      return;
    }

    // Default: simulate until today
    const computedEnd = new Date();

    setLoading(true);
    setResult(null);
    setExpandedRow(null);

    try {
      const freq = parseInt(frequency, 10);
      const { firstMonth, lastMonth } = getSimulationMonthRange(startDate, freq, computedEnd);
      const fetchResult = await fetchIPCData(firstMonth, lastMonth);

      setUsedSample(fetchResult.usedSample);
      setMissingMonths(fetchResult.missingMonths);

      const sim = computeContractSimulation(
        rentNumber, startDate, freq, computedEnd, fetchResult.data
      );
      setResult(sim);

      if (sim.adjustments.some((a) => a.factor < 1)) {
        toast({
          title: "Atención",
          description: "En algún tramo el índice bajó y el alquiler podría reducirse. Esto depende de lo pactado en tu contrato.",
        });
      }
    } catch (err: any) {
      toast({ title: "Error en el cálculo", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.adjustments.map((a) => ({
    name: formatDateArg(a.date),
    alquiler: Math.round(a.rent),
  })) || [];
  if (result && chartData.length > 0) {
    chartData.unshift({ name: "Inicio", alquiler: rentNumber });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Simulación de contrato de alquiler ajustado por IPC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sim-rent">Alquiler inicial (ARS)</Label>
            <Input id="sim-rent" placeholder="Ej: 500.000" value={rent} onChange={(e) => handleRentChange(e.target.value)} inputMode="numeric" />
          </div>

          <div className="space-y-2">
            <Label>Fecha de inicio del contrato</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: es }) : "Seleccioná una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={(d) => d < MIN_DATE} className="p-3 pointer-events-auto" locale={es} captionLayout="dropdown" fromYear={2020} toYear={new Date().getFullYear() + 1} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Frecuencia de ajuste</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Cada 3 meses (trimestral)</SelectItem>
                <SelectItem value="4">Cada 4 meses (cuatrimestral)</SelectItem>
                <SelectItem value="6">Cada 6 meses (semestral)</SelectItem>
                <SelectItem value="12">Cada 12 meses (anual)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" size="lg" onClick={handleCalculate} disabled={loading}>
            {loading ? "Calculando..." : "Ver evolución"}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {result && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
          <span>Datos basados en el <strong>IPC oficial del INDEC</strong>.</span>
        </div>
      )}

      {missingMonths.length > 0 && result && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
          <span>Faltan datos para: {missingMonths.join(", ")}. Los resultados pueden ser incompletos.</span>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Alquiler estimado al final</p>
              <p className="text-lg font-bold font-display text-primary">{formatCurrencyARS(result.finalRent)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Variación total</p>
              <p className="text-lg font-bold font-display flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                {formatPercent(result.totalVariation)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Cantidad de ajustes</p>
              <p className="text-lg font-bold font-display flex items-center gap-1">
                <Hash className="h-4 w-4 text-primary" />
                {result.adjustmentCount}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Meses de IPC aplicados</p>
              <p className="text-lg font-bold font-display">{result.totalMonthsApplied}</p>
            </Card>
          </div>

          {chartData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display">Evolución del alquiler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [formatCurrencyARS(value), "Alquiler"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                      <Line type="monotone" dataKey="alquiler" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Detalle de ajustes</CardTitle>
              <p className="text-xs text-muted-foreground">Tocá una fila para ver las tasas mensuales aplicadas</p>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">N°</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="hidden sm:table-cell">Desde</TableHead>
                      <TableHead className="hidden sm:table-cell">Hasta</TableHead>
                      <TableHead>Factor</TableHead>
                      <TableHead>% tramo</TableHead>
                      <TableHead>Alquiler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.adjustments.map((row) => (
                      <Fragment key={row.number}>
                        <TableRow
                          className={cn("cursor-pointer", row.factor < 1 && "bg-warning/5")}
                          onClick={() => setExpandedRow(expandedRow === row.number ? null : row.number)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1">
                              {row.number}
                              {expandedRow === row.number ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </div>
                          </TableCell>
                          <TableCell>{formatDateArg(row.date)}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">{parseMonthShort(row.fromMonth)}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">{parseMonthShort(row.toMonth)}</TableCell>
                          <TableCell>{row.factor.toFixed(4)}</TableCell>
                          <TableCell className={row.segmentPercent < 0 ? "text-destructive" : ""}>{formatPercent(row.segmentPercent)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrencyARS(row.rent)}</TableCell>
                        </TableRow>
                        {expandedRow === row.number && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-muted/30 p-3">
                              <p className="text-xs font-medium mb-2 text-muted-foreground">Tasas mensuales aplicadas:</p>
                              <div className="flex flex-wrap gap-2">
                                {row.monthlyRates.map((mr) => (
                                  <span key={mr.month} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-background border text-xs">
                                    <span className="text-muted-foreground">{parseMonthShort(mr.month)}:</span>
                                    <span className="font-semibold">{formatRate(mr.rate)}</span>
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* IPC Reference Data Table */}
      <IPCReferenceTable data={allIPCData} source={allIPCSource} />
    </div>
  );
}

function IPCReferenceTable({ data, source }: { data: IPCDataPoint[]; source: "api" | "sample" | "loading" }) {
  const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // Group by year
  const byYear: Record<number, (number | null)[]> = {};
  for (const dp of data) {
    const [y, m] = dp.month.split("-").map(Number);
    if (!byYear[y]) byYear[y] = new Array(12).fill(null);
    byYear[y][m - 1] = dp.rate;
  }
  const years = Object.keys(byYear).map(Number).filter(y => y >= 2022).sort();

  if (source === "loading") {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display">Índice IPC mensual — Variación porcentual</CardTitle>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 border border-blue-200">
            Datos del INDEC
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Variación mensual del IPC según INDEC, desde 2022. Fuente: Argenstats.
        </p>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 font-semibold">Año</TableHead>
                {MONTH_NAMES.map((m) => (
                  <TableHead key={m} className="text-center text-xs px-1.5">{m}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {years.map((year) => (
                <TableRow key={year}>
                  <TableCell className="font-semibold text-foreground">{year}</TableCell>
                  {byYear[year].map((rate, i) => (
                    <TableCell
                      key={`${year}-${i}`}
                      className={cn(
                        "text-center text-xs px-1.5 tabular-nums",
                        rate === null ? "text-muted-foreground/30" : "text-foreground"
                      )}
                    >
                      {rate !== null ? `${rate.toFixed(1)}` : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
