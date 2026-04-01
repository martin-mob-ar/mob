import { z } from 'zod';

export const visitaFormSchema = z.object({
  name: z.string().min(1, 'Ingresá tu nombre'),
  email: z.string().email('Ingresá un email válido'),
  phone: z.string().optional(),
  country_code: z.string().default('+54'),
});

export type VisitaFormValues = z.infer<typeof visitaFormSchema>;

export const visitaApiSchema = z.object({
  propertyId: z.number(),
  proposedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  proposedTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida').refine(
    (v) => v.endsWith(':00') || v.endsWith(':30'),
    'El horario debe ser en punto o a la media hora',
  ),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  country_code: z.string().optional().default('+54'),
  submitterUserId: z.string().uuid().optional(),
});

export type VisitaApiInput = z.infer<typeof visitaApiSchema>;
