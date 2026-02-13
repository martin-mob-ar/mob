import { useState, useEffect, useMemo, useCallback } from "react";
import { Calculator, Building2, AlertTriangle, Info, Loader2, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import bancosData from "@/data/bancos.json";

// ── Types ──────────────────────────────────────────────────────────

interface BancoData {
  banco: string;
  plazo: number;
  monto_maximo: number | null;
  financiacion: number;
  relacion_cuota_ingreso_max: number | null;
  tasa_cobrando_sueldo: number | null;
  tasa_sin_cobrar_sueldo: number | null;
  ingresos_minimos: string;
  suma_de_ingresos: string;
  destino_fondos: string;
  monotributistas: string;
}

interface DolarData {
  venta: number;
  fecha: string;
  exact: boolean;
}

interface UvaData {
  valor: number;
  fecha: string;
  exact: boolean;
}

interface SimulationResult {
  banco: string;
  plazoAnios: number;
  tna: number;
  cuotaARS: number;
  cuotaUVA: number;
  propApoyo: number;
  valorViviendaUVA: number;
  montoInicialUVA: number;
  ingresoNetoNecesario: number | null;
  ingresoNetoMinTitulares: number | null;
  uvaValor: number;
  uvaFecha: string;
  tem: number;
  tipoTasa: string;
}

// ── Constants ──────────────────────────────────────────────────────

const PLAZOS = [5, 10, 15, 20, 25, 30];

// ── Helpers ────────────────────────────────────────────────────────

function sortBancos(bancos: BancoData[]): BancoData[] {
  const nacion = bancos.find((b) => b.banco === "Banco Nación");
  const rest = bancos.filter((b) => b.banco !== "Banco Nación").sort((a, b) => a.banco.localeCompare(b.banco, "es"));
  return nacion ? [nacion, ...rest] : rest;
}

function formatARS(n: number): string {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatUSD(n: number): string {
  return `USD ${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString("es-AR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function calcularCuota(monto: number, tna: number, anios: number): number {
  const i = tna / 12;
  const n = anios * 12;
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

function parseFormattedNumber(str: string): number {
  return parseFloat(str.replace(/\./g, "").replace(/,/g, "")) || 0;
}

function formatInputNumber(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits === "") return "";
  return parseInt(digits).toLocaleString("es-AR");
}

function getTodayAR(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
}

// ── UVA Cache ──────────────────────────────────────────────────────

function getCachedUVA(): UvaData | null {
  try {
    const today = getTodayAR();
    const cached = localStorage.getItem(`uva_${today}`);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore */ }
  return null;
}

function setCachedUVA(data: UvaData) {
  try {
    const today = getTodayAR();
    localStorage.setItem(`uva_${today}`, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ── Component ──────────────────────────────────────────────────────

export default function CalculadoraHipotecaria() {
  const bancos = useMemo(() => sortBancos(bancosData as BancoData[]), []);

  // Form state
  const [selectedBanco, setSelectedBanco] = useState(bancos[0]?.banco ?? "");
  const [cobraSueldo, setCobraSueldo] = useState(true);
  const [plazo, setPlazo] = useState("20");
  const [valorViviendaStr, setValorViviendaStr] = useState("");
  const [montoCreditoStr, setMontoCreditoStr] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  // API state
  const [dolar, setDolar] = useState<DolarData | null>(null);
  const [dolarLoading, setDolarLoading] = useState(true);
  const [dolarError, setDolarError] = useState(false);
  const [uva, setUva] = useState<UvaData | null>(null);
  const [uvaLoading, setUvaLoading] = useState(true);
  const [uvaError, setUvaError] = useState(false);

  // ── Fetch Dollar ──
  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const res = await fetch("https://api.argentinadatos.com/v1/cotizaciones/dolares");
        const data = await res.json();
        const oficiales = data.filter((d: any) => d.casa === "oficial" && d.venta);
        if (!oficiales.length) throw new Error("No data");

        const today = getTodayAR();
        const todayEntry = oficiales.find((d: any) => d.fecha === today);

        if (todayEntry) {
          setDolar({ venta: todayEntry.venta, fecha: todayEntry.fecha, exact: true });
        } else {
          oficiales.sort((a: any, b: any) => b.fecha.localeCompare(a.fecha));
          setDolar({ venta: oficiales[0].venta, fecha: oficiales[0].fecha, exact: false });
        }
      } catch {
        setDolarError(true);
      } finally {
        setDolarLoading(false);
      }
    };
    fetchDolar();
  }, []);

  // ── Fetch UVA (with localStorage cache) ──
  useEffect(() => {
    const cached = getCachedUVA();
    if (cached) {
      setUva(cached);
      setUvaLoading(false);
      return;
    }

    const fetchUVA = async () => {
      try {
        const res = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/uva");
        const data: { fecha: string; valor: number }[] = await res.json();
        if (!data.length) throw new Error("No data");

        const today = getTodayAR();
        const todayEntry = data.find((d) => d.fecha === today);

        let uvaData: UvaData;
        if (todayEntry) {
          uvaData = { valor: todayEntry.valor, fecha: todayEntry.fecha, exact: true };
        } else {
          data.sort((a, b) => b.fecha.localeCompare(a.fecha));
          uvaData = { valor: data[0].valor, fecha: data[0].fecha, exact: false };
        }
        setUva(uvaData);
        setCachedUVA(uvaData);
      } catch {
        setUvaError(true);
      } finally {
        setUvaLoading(false);
      }
    };
    fetchUVA();
  }, []);

  // ── Derived values ──
  const banco = useMemo(() => bancos.find((b) => b.banco === selectedBanco), [bancos, selectedBanco]);
  const plazoNum = parseInt(plazo);
  const valorVivienda = parseFormattedNumber(valorViviendaStr);
  const montoCredito = parseFormattedNumber(montoCreditoStr);

  const sinTasa = banco && !cobraSueldo && banco.tasa_sin_cobrar_sueldo === null;

  const montoMaxPorLTV = banco && valorVivienda > 0
    ? valorVivienda * banco.financiacion
    : null;
  const ltvExcedido = montoMaxPorLTV !== null && montoCredito > 0 && montoCredito > montoMaxPorLTV;

  const montoMaxBancoARS = banco && banco.monto_maximo && dolar
    ? banco.monto_maximo * dolar.venta
    : null;
  const montoMaxBancoExcedido = montoMaxBancoARS !== null && montoCredito > 0 && montoCredito > montoMaxBancoARS;

  // Auto-adjust plazo
  useEffect(() => {
    if (banco && plazoNum > banco.plazo) {
      setPlazo(String(banco.plazo));
    }
  }, [banco, plazoNum]);

  const canCalculate = banco && montoCredito > 0 && valorVivienda > 0 && !sinTasa && !ltvExcedido && montoCredito <= valorVivienda && uva;

  const handleCalculate = useCallback(() => {
    if (!banco || !canCalculate || !uva) return;

    const tna = cobraSueldo ? banco.tasa_cobrando_sueldo! : banco.tasa_sin_cobrar_sueldo!;
    const cuotaARS = calcularCuota(montoCredito, tna, plazoNum);
    const cuotaUVA = cuotaARS / uva.valor;
    const propApoyo = montoCredito / valorVivienda;
    const valorViviendaUVA = valorVivienda / uva.valor;
    const montoInicialUVA = montoCredito / uva.valor;
    const tem = tna / 12;

    const ingresoNetoNecesario = banco.relacion_cuota_ingreso_max
      ? cuotaARS / banco.relacion_cuota_ingreso_max
      : null;
    const ingresoNetoMinTitulares = ingresoNetoNecesario
      ? ingresoNetoNecesario / 2
      : null;

    setResult({
      banco: banco.banco,
      plazoAnios: plazoNum,
      tna,
      cuotaARS,
      cuotaUVA,
      propApoyo,
      valorViviendaUVA,
      montoInicialUVA,
      ingresoNetoNecesario,
      ingresoNetoMinTitulares,
      uvaValor: uva.valor,
      uvaFecha: uva.fecha,
      tem,
      tipoTasa: cobraSueldo ? "Cobrando sueldo" : "Sin cobrar sueldo",
    });
  }, [banco, canCalculate, cobraSueldo, montoCredito, valorVivienda, plazoNum, uva]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCalculate();
    }
  };

  const clearResult = () => setResult(null);

  const isLoading = dolarLoading || uvaLoading;

  return (
    <Card className="border-border/40 bg-card mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Calculadora de crédito hipotecario</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Simulá una cuota estimada según banco, plazo y montos. En UVA, el valor en pesos puede variar con la inflación.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando cotizaciones…
          </div>
        )}

        {/* ── Form ── */}
        <div className="grid sm:grid-cols-2 gap-4" onKeyDown={handleKeyDown}>
          {/* Bank */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Banco</Label>
            <Select value={selectedBanco} onValueChange={(v) => { setSelectedBanco(v); clearResult(); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bancos.map((b) => (
                  <SelectItem key={b.banco} value={b.banco}>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {b.banco}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plazo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plazo</Label>
            <Select value={plazo} onValueChange={(v) => { setPlazo(v); clearResult(); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAZOS.map((p) => (
                  <SelectItem key={p} value={String(p)} disabled={banco ? p > banco.plazo : false}>
                    {p} años {banco && p > banco.plazo ? "(excede máximo)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {banco && (
              <p className="text-[11px] text-muted-foreground">
                Plazo máximo de {banco.banco}: {banco.plazo} años
              </p>
            )}
          </div>

          {/* Valor vivienda */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Valor de la vivienda (ARS)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 80.000.000"
                value={valorViviendaStr}
                onChange={(e) => { setValorViviendaStr(formatInputNumber(e.target.value)); clearResult(); }}
                className="pl-7"
              />
            </div>
            {dolar && valorVivienda > 0 && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ≈ {formatUSD(valorVivienda / dolar.venta)}
              </p>
            )}
          </div>

          {/* Monto crédito */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Monto del crédito a solicitar (ARS)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 50.000.000"
                value={montoCreditoStr}
                onChange={(e) => { setMontoCreditoStr(formatInputNumber(e.target.value)); clearResult(); }}
                className="pl-7"
              />
            </div>
            {dolar && montoCredito > 0 && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ≈ {formatUSD(montoCredito / dolar.venta)}
              </p>
            )}
            {ltvExcedido && banco && montoMaxPorLTV && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {banco.banco} financia hasta el {(banco.financiacion * 100).toFixed(0)}% del valor de la vivienda.
                Máximo financiable: {formatARS(montoMaxPorLTV)}.
              </p>
            )}
            {montoMaxBancoExcedido && montoMaxBancoARS && banco && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Supera el máximo publicado por {banco.banco} ({formatARS(montoMaxBancoARS)}).
              </p>
            )}
            {montoCredito > 0 && valorVivienda > 0 && montoCredito > valorVivienda && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                El monto del crédito no puede superar el valor de la vivienda.
              </p>
            )}
          </div>

          {/* Toggle sueldo */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              ¿Acreditás sueldo en el banco?
            </Label>
            <div className="flex items-center gap-3 h-10">
              <Switch checked={cobraSueldo} onCheckedChange={(v) => { setCobraSueldo(v); clearResult(); }} />
              <span className="text-sm font-medium">{cobraSueldo ? "Sí" : "No"}</span>
            </div>
            {sinTasa && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Este banco no publica tasa sin acreditación de sueldo. Probá con "Sí" o elegí otro banco.
              </p>
            )}
          </div>
        </div>

        {/* ── API info line ── */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-muted-foreground border-t border-border/30 pt-3">
          {dolarLoading ? (
            <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Dólar…</span>
          ) : dolarError ? (
            <span>Dólar oficial no disponible</span>
          ) : dolar ? (
            <span>Dólar oficial (venta): ${dolar.venta.toLocaleString("es-AR")} — {dolar.exact ? dolar.fecha : `última: ${dolar.fecha}`}</span>
          ) : null}

          {uvaLoading ? (
            <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> UVA…</span>
          ) : uvaError ? (
            <span>UVA no disponible</span>
          ) : uva ? (
            <span>UVA: ${formatNumber(uva.valor)} — {uva.exact ? uva.fecha : `última: ${uva.fecha}`}</span>
          ) : null}
        </div>

        {/* ── Info badges ── */}
        {banco && (
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
              Financiación: hasta {(banco.financiacion * 100).toFixed(0)}%
            </span>
            {banco.relacion_cuota_ingreso_max && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                <Info className="h-3 w-3" />
                Cuota–ingreso máx: {(banco.relacion_cuota_ingreso_max * 100).toFixed(0)}%
              </span>
            )}
            {montoMaxBancoARS && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                Monto máx: {formatARS(montoMaxBancoARS)}
              </span>
            )}
          </div>
        )}

        {/* ── Calculate button ── */}
        <Button onClick={handleCalculate} disabled={!canCalculate} className="w-full sm:w-auto" size="lg">
          <Calculator className="h-4 w-4 mr-2" />
          Calcular cuota estimada
        </Button>

        {/* ── Results: two-panel layout ── */}
        {result && (
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {/* Card 1: Detalles de préstamo */}
            <Card className="border-primary/20 overflow-hidden">
              <div className="bg-primary px-4 py-2.5">
                <h3 className="text-sm font-semibold text-primary-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Detalles de préstamo
                </h3>
              </div>
              <CardContent className="p-4 space-y-3">
                <ResultRow label="Prop. de apoyo" value={`${(result.propApoyo * 100).toFixed(0)}%`} />
                <ResultRow label="Cuota en UVAs" value={formatNumber(result.cuotaUVA)} />
                <ResultRow label="Valor propiedad en UVA" value={formatNumber(result.valorViviendaUVA, 0)} />
                <ResultRow label="Monto inicial en UVA" value={formatNumber(result.montoInicialUVA, 0)} />
                {result.ingresoNetoNecesario && (
                  <ResultRow
                    label="Ingresos netos necesarios (est.)"
                    value={formatARS(result.ingresoNetoNecesario)}
                  />
                )}
                {result.ingresoNetoMinTitulares && (
                  <ResultRow
                    label="Ingr. netos mín. titulares (est.)"
                    value={formatARS(result.ingresoNetoMinTitulares)}
                  />
                )}

                {/* Highlighted cuota */}
                <div className="border-t border-border/40 pt-3 mt-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cuota en $</p>
                  <p className="text-3xl font-bold text-foreground">{formatARS(result.cuotaARS)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.plazoAnios} años · {result.plazoAnios * 12} cuotas · {result.tipoTasa}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Tasas */}
            <Card className="border-primary/20 overflow-hidden">
              <div className="bg-primary px-4 py-2.5">
                <h3 className="text-sm font-semibold text-primary-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tasas
                </h3>
              </div>
              <CardContent className="p-4 space-y-3">
                <ResultRow label="UVA" value={`$${formatNumber(result.uvaValor)}`} sub={result.uvaFecha} />
                <ResultRow label="TNA" value={`${(result.tna * 100).toFixed(2)}%`} />
                <ResultRow label="TEM" value={`${(result.tem * 100).toFixed(4)}%`} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Disclaimer */}
        {result && (
          <Alert className="border-muted bg-muted/30">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-xs text-muted-foreground">
              La cuota es estimativa. En créditos UVA, el valor en pesos se ajusta por inflación (CER).
              Las condiciones finales dependen de la evaluación crediticia del banco.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ── Result Row sub-component ──

function ResultRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
