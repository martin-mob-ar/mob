import rawData from "./hipotecarios-raw.json";

export interface HipotecarioOferta {
  id: string;
  banco: string;
  producto: string;
  fecha_info: string;
  tipo_credito: "UVA" | "Pesos";
  tna: number;
  monto_max: number;
  plazo_max_anios: number;
  tipo_tasa: "Fija" | "Variable";
  destino: string;
  ltv: number | null;
  beneficiarios: string;
  edad_max: number;
}

interface RawItem {
  id: string;
  banco: string | null;
  producto: string;
  fecha_info: string;
  tipo_credito: string;
  tna: number;
  monto_max: number;
  plazo_max_anios: number;
  tipo_tasa: string;
  destino: string;
  ltv: number;
  beneficiarios: string[];
  edad_max: number;
}

const BANK_NAME_MAP: Record<string, string> = {
  "casa bancor uvas": "Banco de la Provincia de Córdoba",
};

const VALID_DESTINOS = [
  "1ra vivienda",
  "Refacción",
  "2da vivienda",
  "Construcción",
  "Otros destinos",
];

function normalizeBanco(banco: string | null): string | null {
  if (!banco) return null;
  const lower = banco.toLowerCase().trim();
  return BANK_NAME_MAP[lower] || banco;
}

function normalizeDestino(destino: string): string {
  const found = VALID_DESTINOS.find(
    (d) => d.toLowerCase() === destino.toLowerCase().trim()
  );
  return found || destino;
}

function normalizeLtv(ltv: number): number | null {
  if (ltv === null || ltv === undefined) return null;
  // Fix values like 0.75 that should be 75
  if (ltv > 0 && ltv < 1) return Math.round(ltv * 100);
  // Values like 99.99 are valid
  if (ltv > 100) return null;
  return ltv;
}

function processData(): HipotecarioOferta[] {
  const raw = rawData as RawItem[];
  const seen = new Set<string>();
  const result: HipotecarioOferta[] = [];

  for (const item of raw) {
    const banco = normalizeBanco(item.banco);
    // Skip items without a bank
    if (!banco) continue;

    const destino = normalizeDestino(item.destino);
    const tipo_credito = item.tipo_credito === "UVA" ? "UVA" : "Pesos";
    const tipo_tasa = item.tipo_tasa === "Fija" ? "Fija" : "Variable";
    const ltv = normalizeLtv(item.ltv);

    // Dedup key
    const dedupKey = `${banco}|${tipo_credito}|${destino}|${item.tna}|${item.monto_max}|${item.plazo_max_anios}|${tipo_tasa}|${ltv}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    const beneficiariosText = item.beneficiarios.length > 0
      ? item.beneficiarios.join(", ")
      : "Todos los beneficiarios";

    // Clean producto name
    let producto = item.producto
      .replace(/\ufeff/g, "")
      .trim();
    // Capitalize first letter
    if (producto.length > 0) {
      producto = producto.charAt(0).toUpperCase() + producto.slice(1);
    }

    result.push({
      id: `${dedupKey}-${result.length}`,
      banco,
      producto,
      fecha_info: item.fecha_info,
      tipo_credito,
      tna: item.tna,
      monto_max: item.monto_max,
      plazo_max_anios: item.plazo_max_anios,
      tipo_tasa,
      destino,
      ltv,
      beneficiarios: beneficiariosText,
      edad_max: item.edad_max,
    });
  }

  // Sort: Banco Nación first, then by TNA asc, then plazo desc
  result.sort((a, b) => {
    const aNacion = a.banco === "Banco de la Nación Argentina" ? 0 : 1;
    const bNacion = b.banco === "Banco de la Nación Argentina" ? 0 : 1;
    if (aNacion !== bNacion) return aNacion - bNacion;
    if (a.tna !== b.tna) return a.tna - b.tna;
    return b.plazo_max_anios - a.plazo_max_anios;
  });

  return result;
}

export const hipotecarios = processData();

export const BANCOS_DISPONIBLES = Array.from(
  new Set(hipotecarios.map((h) => h.banco))
).sort((a, b) => a.localeCompare(b, "es"));

export const DESTINOS = [
  "Todos",
  "1ra vivienda",
  "Refacción",
  "2da vivienda",
  "Construcción",
  "Otros destinos",
];

export const TIPOS_CREDITO = ["Todos", "UVA", "Pesos"];

export function formatMonto(monto: number): string {
  if (monto >= 9999999999) return "Sin tope";
  if (monto >= 999999999) return "Sin tope";
  if (monto >= 1000000) return `$${(monto / 1000000).toFixed(0)}M`;
  return `$${monto.toLocaleString("es-AR")}`;
}
