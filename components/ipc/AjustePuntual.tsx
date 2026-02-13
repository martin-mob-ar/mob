import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  type RoundingOption,
  type AdjustmentResult,
  MIN_DATE,
  formatCurrencyARS,
  formatPercent,
  formatRate,
  getMonthKey,
  monthBefore,
  fetchIPCData,
  computeSingleAdjustment,
  parseMonthLabel,
} from "@/services/ipcService";
import { useToast } from "@/hooks/use-toast";

export default function AjustePuntual() {
  const { toast } = useToast();
  const [rent, setRent] = useState("");
  const [lastDate, setLastDate] = useState<Date>();
  const [newDate, setNewDate] = useState<Date>();
  const [rounding, setRounding] = useState<RoundingOption>("none");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdjustmentResult | null>(null);
  const [usedSample, setUsedSample] = useState(false);
  const [missingMonths, setMissingMonths] = useState<string[]>([]);

  const rentNumber = parseInt(rent.replace(/\D/g, ""), 10) || 0;

  const handleRentChange = (val: string) => {
    const raw = val.replace(/\D/g, "");
    if (!raw) { setRent(""); return; }
    setRent(parseInt(raw, 10).toLocaleString("es-AR"));
  };

  const handleCalculate = async () => {
    if (!rentNumber || rentNumber <= 0) {
      toast({ title: "Error", description: "Ingresá un monto válido.", variant: "destructive" });
      return;
    }
    if (!lastDate || !newDate) {
      toast({ title: "Error", description: "Completá ambas fechas.", variant: "destructive" });
      return;
    }
    if (lastDate < MIN_DATE) {
      toast({ title: "Error", description: "Elegí una fecha desde 01/2020 en adelante.", variant: "destructive" });
      return;
    }
    if (newDate <= lastDate) {
      toast({ title: "Error", description: "La fecha del nuevo ajuste debe ser posterior al último.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const baseMonth = getMonthKey(lastDate);
      const targetMonth = getMonthKey(newDate);

      // We need rates from baseMonth to month before targetMonth
      const lastNeeded = monthBefore(targetMonth);

      const fetchResult = await fetchIPCData(baseMonth, lastNeeded);
      setUsedSample(fetchResult.usedSample);
      setMissingMonths(fetchResult.missingMonths);

      const adj = computeSingleAdjustment(rentNumber, baseMonth, targetMonth, fetchResult.data, rounding);
      setResult(adj);

      if (adj.factor < 1) {
        toast({
          title: "Atención",
          description: "El índice bajó en este período. El alquiler resultante es menor. Verificá lo pactado en tu contrato.",
        });
      }
    } catch (err: any) {
      toast({ title: "Error en el cálculo", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Datos del ajuste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adj-rent">Alquiler actual (ARS)</Label>
            <Input id="adj-rent" placeholder="Ej: 450.000" value={rent} onChange={(e) => handleRentChange(e.target.value)} inputMode="numeric" />
          </div>

          <div className="space-y-2">
            <Label>Fecha del último ajuste</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !lastDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastDate ? format(lastDate, "dd/MM/yyyy", { locale: es }) : "Seleccioná una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={lastDate} onSelect={setLastDate} disabled={(d) => d < MIN_DATE} className="p-3 pointer-events-auto" locale={es} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Fecha del nuevo ajuste</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newDate ? format(newDate, "dd/MM/yyyy", { locale: es }) : "Seleccioná una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={newDate} onSelect={setNewDate} disabled={(d) => d < (lastDate || MIN_DATE)} className="p-3 pointer-events-auto" locale={es} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Redondeo (opcional)</Label>
            <Select value={rounding} onValueChange={(v) => setRounding(v as RoundingOption)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin redondeo</SelectItem>
                <SelectItem value="1">Al peso</SelectItem>
                <SelectItem value="10">A $10</SelectItem>
                <SelectItem value="100">A $100</SelectItem>
                <SelectItem value="1000">A $1.000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" size="lg" onClick={handleCalculate} disabled={loading}>
            {loading ? "Calculando..." : "Actualizar valor"}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
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
          <span>Faltan datos para: {missingMonths.join(", ")}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-5 border-primary/20 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-1">Nuevo alquiler estimado</p>
              <p className="text-2xl font-bold font-display text-primary">{formatCurrencyARS(result.newRent)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground mb-1">Variación acumulada</p>
              <p className={cn("text-2xl font-bold font-display", result.variation < 0 ? "text-destructive" : "")}>
                {formatPercent(result.variation)}
              </p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Tasas mensuales aplicadas</CardTitle>
              <p className="text-xs text-muted-foreground">
                Se aplican los IPC desde {parseMonthLabel(result.fromMonth)} hasta {parseMonthLabel(result.toMonth)} (el mes del ajuste no se incluye)
              </p>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead>IPC mensual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.monthlyRates.map((mr) => (
                    <TableRow key={mr.month}>
                      <TableCell className="font-medium">{parseMonthLabel(mr.month)}</TableCell>
                      <TableCell>{formatRate(mr.rate)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-semibold">
                    <TableCell>Factor combinado</TableCell>
                    <TableCell>{result.factor.toFixed(4)}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold">
                    <TableCell>Variación total</TableCell>
                    <TableCell className={result.variation < 0 ? "text-destructive" : ""}>{formatPercent(result.variation)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
