import type { TruoraWebhookPayload } from '@/lib/validations/truora-webhook';

const HOGGAX_API_URL = process.env.HOGGAX_API_URL;

// --- Mapping: Truora text → Hoggax IDs ---

const GENDER_MAP: Record<string, number> = {
  'Masculino': 1,
  'Femenino': 2,
};

const EMPLOYMENT_SITUATION_MAP: Record<string, number> = {
  'Estudiante universitario': 1,
  'Jubilado/a': 2,
  'Monotributista': 3,
  'Relación de dependencia': 4,
  'Responsable Inscripto': 5,
};

const ANTIQUITY_MAP: Record<string, number> = {
  '0 a 5 meses': 1,
  '6 a 12 meses': 2,
  '1 a 2 años': 3,
  '2 años o más': 4,
};

// Employment types that do NOT require antiquity
const NO_ANTIQUITY_TYPES = new Set([1, 2]); // Estudiante, Jubilado
// Employment types that do NOT require income
const NO_INCOME_TYPES = new Set([1]); // Estudiante

export function mapGenderId(genero: string): number {
  const id = GENDER_MAP[genero];
  if (!id) throw new Error(`Género no reconocido: ${genero}`);
  return id;
}

export function mapEmploymentSituationId(situacion: string): number {
  const id = EMPLOYMENT_SITUATION_MAP[situacion];
  if (!id) throw new Error(`Situación laboral no reconocida: ${situacion}`);
  return id;
}

export function mapAntiquityId(antiguedad: string): number {
  const id = ANTIQUITY_MAP[antiguedad];
  if (!id) throw new Error(`Antigüedad no reconocida: ${antiguedad}`);
  return id;
}

// --- Hoggax API call ---

export interface HoggaxQualifyRequest {
  document_type_id: number;
  document_value: string;
  gender_id: number;
  employment_situation_id: number;
  antiquity_id?: number;
  monthly_income?: number;
}

export interface HoggaxQualifyResponse {
  approved: boolean;
  max_rent_plus_expenses?: number;
  [key: string]: unknown;
}

export function buildQualifyRequest(payload: TruoraWebhookPayload): HoggaxQualifyRequest {
  const employmentId = mapEmploymentSituationId(payload.employment_situation_id);

  const request: HoggaxQualifyRequest = {
    document_type_id: 1, // DNI
    document_value: payload.document_value,
    gender_id: mapGenderId(payload.gender_id),
    employment_situation_id: employmentId,
  };

  // Add antiquity if the employment type requires it
  if (!NO_ANTIQUITY_TYPES.has(employmentId) && payload.antiquity_id) {
    request.antiquity_id = mapAntiquityId(payload.antiquity_id);
  }

  // Add monthly income if the employment type requires it
  if (!NO_INCOME_TYPES.has(employmentId) && payload.monthly_income != null) {
    request.monthly_income = payload.monthly_income;
  }

  return request;
}

export async function qualify(
  payload: TruoraWebhookPayload
): Promise<{ request: HoggaxQualifyRequest; response: HoggaxQualifyResponse }> {
  if (!HOGGAX_API_URL) {
    throw new Error('HOGGAX_API_URL no configurada');
  }

  const request = buildQualifyRequest(payload);

  const res = await fetch(`${HOGGAX_API_URL}/hoggax-partner-qualify`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const responseBody = await res.json();

  if (!res.ok) {
    console.error('[Hoggax] API error:', res.status, responseBody);
    throw new Error(
      `Hoggax API error ${res.status}: ${JSON.stringify(responseBody)}`
    );
  }

  return { request, response: responseBody as HoggaxQualifyResponse };
}
