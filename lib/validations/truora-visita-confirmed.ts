import { z } from 'zod';

export const truoraVisitaConfirmedSchema = z.object({
  phone: z.string().min(6, 'Teléfono requerido'),
  property_id: z.string().min(1, 'property_id requerido'),
  visit_date: z.string().min(1, 'visit_date requerido'), // yyyy-MM-dd
  visit_time: z.string().min(1, 'visit_time requerido'), // HH:mm
});

export type TruoraVisitaConfirmedPayload = z.infer<typeof truoraVisitaConfirmedSchema>;
