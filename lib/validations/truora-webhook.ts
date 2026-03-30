import { z } from 'zod';

// Accepts the field names already configured in Truora's integration
// (Hoggax-style keys). Our API transforms the text values to Hoggax IDs.
export const truoraWebhookSchema = z.object({
  phone: z.string().min(6, 'Teléfono requerido'),
  document_value: z.string().min(6, 'DNI requerido'),
  document_type_id: z.string().optional(), // "DNI" or "Pasaporte"
  gender_id: z
    .string()
    .transform((v) => v.replace(/[()]/g, '').trim()) // normalize "Femenino)" → "Femenino"
    .pipe(z.enum(['Masculino', 'Femenino', 'Otro'])),
  employment_situation_id: z.enum([
    'Relación de dependencia',
    'Monotributista',
    'Responsable Inscripto',
    'Estudiante universitario',
    'Jubilado/a',
  ]),
  antiquity_id: z
    .enum(['0 a 5 meses', '6 a 12 meses', '1 a 2 años', '2 años o más'])
    .nullable()
    .optional(),
  monthly_income: z
    .union([z.number().int(), z.string().transform((v) => parseInt(v.replace(/\./g, ''), 10))])
    .nullable()
    .optional(),
  rent: z
    .union([z.number(), z.string().transform((v) => parseInt(v.replace(/\./g, ''), 10))])
    .nullable()
    .optional(),
  expenses: z
    .union([z.number(), z.string().transform((v) => parseInt(v.replace(/\./g, ''), 10))])
    .nullable()
    .optional(),
});

export type TruoraWebhookPayload = z.infer<typeof truoraWebhookSchema>;
