import { z } from 'zod';

export const truoraWebhookSchema = z.object({
  phone: z.string().min(6, 'Teléfono requerido'),
  dni: z.string().min(6, 'DNI requerido'),
  genero: z
    .string()
    .transform((v) => v.replace(/[()]/g, '').trim()) // normalize "Femenino)" → "Femenino"
    .pipe(z.enum(['Masculino', 'Femenino'])),
  situacion_laboral: z.enum([
    'Relación de dependencia',
    'Monotributista',
    'Responsable Inscripto',
    'Estudiante universitario',
    'Jubilado/a',
  ]),
  antiguedad: z
    .enum(['0 a 5 meses', '6 a 12 meses', '1 a 2 años', '2 años o más'])
    .nullable()
    .optional(),
  ingresos_mensuales: z
    .union([z.number().int(), z.string().transform((v) => parseInt(v, 10))])
    .nullable()
    .optional(),
});

export type TruoraWebhookPayload = z.infer<typeof truoraWebhookSchema>;
