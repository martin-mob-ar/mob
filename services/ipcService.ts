// === Types ===
export interface IPCDataPoint {
  month: string; // "YYYY-MM"
  rate: number; // Monthly inflation rate (percentage, e.g. 2.3 means 2.3%)
}

export interface MonthlyRate {
  month: string;
  rate: number;
}

export interface AdjustmentRow {
  number: number;
  date: Date;
  fromMonth: string; // first month applied (inclusive)
  toMonth: string; // last month applied (inclusive)
  monthlyRates: MonthlyRate[];
  factor: number;
  segmentPercent: number;
  rent: number;
}

export interface SimulationResult {
  adjustments: AdjustmentRow[];
  finalRent: number;
  totalVariation: number;
  adjustmentCount: number;
  totalMonthsApplied: number;
}

export interface AdjustmentResult {
  newRent: number;
  variation: number;
  fromMonth: string;
  toMonth: string;
  monthlyRates: MonthlyRate[];
  factor: number;
}

export type RoundingOption = "none" | "1" | "10" | "100" | "1000";

// === Date Utilities ===
export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function firstDayOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
}

export function monthAfter(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function monthBefore(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, "0")}`;
}

export function addMonthsRobust(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const dayOfMonth = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() !== dayOfMonth) {
    result.setDate(0);
  }
  return result;
}

export function parseMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const names = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${names[m - 1]} ${y}`;
}

export function parseMonthShort(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${names[m - 1]} ${y}`;
}

export function formatDateArg(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

// === Formatting ===
export function formatCurrencyARS(n: number): string {
  return `$ ${Math.round(n).toLocaleString("es-AR")}`;
}

export function formatPercent(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} %`;
}

export function formatRate(n: number): string {
  return `${n.toFixed(1).replace(".", ",")} %`;
}

// === Rounding ===
export function applyRounding(value: number, rounding: RoundingOption): number {
  switch (rounding) {
    case "1": return Math.round(value);
    case "10": return Math.round(value / 10) * 10;
    case "100": return Math.round(value / 100) * 100;
    case "1000": return Math.round(value / 1000) * 1000;
    default: return value;
  }
}

// === Month range utilities ===
/** Returns months from `from` up to but NOT including `to` */
function getMonthsInRange(from: string, to: string): string[] {
  const months: string[] = [];
  let current = from;
  while (current < to) {
    months.push(current);
    current = monthAfter(current);
  }
  return months;
}

// === Sample IPC Data (fallback) ===
function generateSampleData(): IPCDataPoint[] {
  const rates: Record<number, number[]> = {
    2020: [2.3, 2.0, 3.3, 1.5, 1.5, 2.2, 1.9, 2.7, 2.8, 3.8, 3.2, 4.0],
    2021: [3.9, 3.6, 4.8, 4.1, 3.3, 3.2, 3.0, 2.5, 3.5, 3.5, 2.5, 3.8],
    2022: [3.9, 4.7, 6.7, 6.0, 5.1, 5.3, 7.4, 7.0, 6.2, 6.3, 4.9, 5.1],
    2023: [6.0, 6.6, 7.7, 8.4, 7.8, 6.0, 6.3, 12.4, 12.7, 8.3, 12.8, 25.5],
    2024: [20.6, 13.2, 11.0, 8.8, 4.2, 4.6, 4.0, 4.2, 3.5, 2.7, 2.4, 2.7],
    2025: [2.2, 2.4, 3.7, 2.8, 1.5, 1.6, 1.9, 1.9, 2.1, 2.3, 2.5, 2.8],
    2026: [2.9, 2.9, 3.4],
  };
  const data: IPCDataPoint[] = [];
  for (const year of Object.keys(rates).map(Number)) {
    for (let m = 0; m < rates[year].length; m++) {
      data.push({
        month: `${year}-${String(m + 1).padStart(2, "0")}`,
        rate: rates[year][m],
      });
    }
  }
  return data;
}

const SAMPLE_DATA = generateSampleData();

export function getLastAvailableMonth(): { month: string; rate: number } {
  const last = SAMPLE_DATA[SAMPLE_DATA.length - 1];
  return { month: last.month, rate: last.rate };
}

export const MIN_DATE = new Date(2020, 0, 1);

/** Fetch all IPC data from 2020-01 to current month for the reference table */
export async function fetchAllIPCData(): Promise<FetchResult> {
  const now = new Date();
  const currentMonth = getMonthKey(now);
  return fetchIPCData("2020-01", currentMonth);
}

export interface FetchResult {
  data: IPCDataPoint[];
  usedSample: boolean;
  missingMonths: string[];
}

const ipcCache: Record<string, IPCDataPoint[]> = {};

export async function fetchIPCData(fromMonth: string, toMonth: string): Promise<FetchResult> {
  const cacheKey = `${fromMonth}_${toMonth}`;
  if (ipcCache[cacheKey]) {
    return { data: ipcCache[cacheKey], usedSample: false, missingMonths: [] };
  }

  try {
    const response = await fetch(`/api/ipc?from=${fromMonth}&to=${toMonth}`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const result: IPCDataPoint[] = (json.data ?? []).sort(
      (a: IPCDataPoint, b: IPCDataPoint) => a.month.localeCompare(b.month)
    );

    if (result.length > 0) {
      ipcCache[cacheKey] = result;
      const missing = findMissingMonths(fromMonth, toMonth, result);
      if (missing.length > 0) console.log("Meses faltantes:", missing);
      return { data: result, usedSample: false, missingMonths: missing };
    }
  } catch (err) {
    console.warn("IPC API fetch falló, usando datos de ejemplo:", err);
  }

  // Fallback: hardcoded sample data (used when API/DB is unavailable)
  const filtered = SAMPLE_DATA.filter(
    (d) => d.month >= fromMonth && d.month <= toMonth
  );
  const missing = findMissingMonths(fromMonth, toMonth, filtered);
  return { data: filtered, usedSample: true, missingMonths: missing };
}

function findMissingMonths(from: string, to: string, data: IPCDataPoint[]): string[] {
  const available = new Set(data.map((d) => d.month));
  const missing: string[] = [];
  let current = from;
  while (current <= to) {
    if (!available.has(current)) missing.push(current);
    current = monthAfter(current);
  }
  return missing;
}

// === Core calculation: multiply monthly rates ===
function computeFactorFromRates(
  data: IPCDataPoint[],
  months: string[]
): { factor: number; rates: MonthlyRate[] } {
  let factor = 1;
  const rates: MonthlyRate[] = [];
  for (const m of months) {
    const dp = data.find((d) => d.month === m);
    if (!dp) throw new Error(`Falta el dato de IPC para ${parseMonthLabel(m)}. Puede que no esté publicado todavía.`);
    factor *= 1 + dp.rate / 100;
    rates.push({ month: m, rate: dp.rate });
  }
  return { factor, rates };
}

// === Calculations ===

/**
 * Ajuste puntual: aplica las tasas mensuales desde baseMonth hasta el mes anterior a targetMonth.
 * Ejemplo: base=Nov, target=Feb → aplica Nov, Dic, Ene
 */
export function computeSingleAdjustment(
  currentRent: number,
  baseMonth: string,
  targetMonth: string,
  data: IPCDataPoint[],
  rounding: RoundingOption = "none"
): AdjustmentResult {
  const months = getMonthsInRange(baseMonth, targetMonth);
  if (months.length === 0) {
    throw new Error("No hay meses de IPC para aplicar entre esas fechas.");
  }

  const { factor, rates } = computeFactorFromRates(data, months);
  const newRent = applyRounding(currentRent * factor, rounding);
  const variation = (factor - 1) * 100;

  return {
    newRent,
    variation,
    fromMonth: months[0],
    toMonth: months[months.length - 1],
    monthlyRates: rates,
    factor,
  };
}

/**
 * Simulación de contrato: para cada tramo, aplica las tasas mensuales
 * desde el mes base del tramo hasta el mes anterior a la fecha de ajuste.
 */
export function computeContractSimulation(
  initialRent: number,
  startDate: Date,
  frequencyMonths: number,
  endDate: Date,
  data: IPCDataPoint[],
  rounding: RoundingOption = "none"
): SimulationResult {
  const adjustments: AdjustmentRow[] = [];
  let currentRent = initialRent;
  let currentBaseDate = startDate;
  let adjustNum = 0;
  let totalMonthsApplied = 0;

  let nextAdjust = addMonthsRobust(startDate, frequencyMonths);

  while (nextAdjust <= endDate) {
    adjustNum++;
    const baseMonth = getMonthKey(currentBaseDate);
    const targetMonth = getMonthKey(nextAdjust);

    // Apply months from baseMonth to month before targetMonth
    const months = getMonthsInRange(baseMonth, targetMonth);
    if (months.length === 0) {
      throw new Error(`No hay meses para aplicar en el ajuste N° ${adjustNum}.`);
    }

    const { factor, rates } = computeFactorFromRates(data, months);
    currentRent = applyRounding(currentRent * factor, rounding);
    const segmentPercent = (factor - 1) * 100;
    totalMonthsApplied += months.length;

    adjustments.push({
      number: adjustNum,
      date: nextAdjust,
      fromMonth: months[0],
      toMonth: months[months.length - 1],
      monthlyRates: rates,
      factor,
      segmentPercent,
      rent: currentRent,
    });

    currentBaseDate = nextAdjust;
    nextAdjust = addMonthsRobust(startDate, frequencyMonths * (adjustNum + 1));
  }

  const totalVariation = initialRent > 0 ? ((currentRent / initialRent) - 1) * 100 : 0;

  return {
    adjustments,
    finalRent: currentRent,
    totalVariation,
    adjustmentCount: adjustments.length,
    totalMonthsApplied,
  };
}

/**
 * Calcula el rango completo de meses necesarios para la simulación.
 * Necesitamos desde el mes de inicio hasta el mes anterior al último ajuste.
 */
export function getSimulationMonthRange(
  startDate: Date,
  frequencyMonths: number,
  endDate: Date
): { firstMonth: string; lastMonth: string } {
  const startMonth = getMonthKey(startDate);
  let lastNeeded = startMonth;

  let n = 1;
  let next = addMonthsRobust(startDate, frequencyMonths * n);
  while (next <= endDate) {
    // We need months up to the month BEFORE this adjustment date
    const targetMonth = getMonthKey(next);
    const lastApplied = monthBefore(targetMonth);
    if (lastApplied > lastNeeded) lastNeeded = lastApplied;
    n++;
    next = addMonthsRobust(startDate, frequencyMonths * n);
  }

  return { firstMonth: startMonth, lastMonth: lastNeeded };
}
