import { z } from 'zod';

export const truoraOutboundSchema = z.object({
  phone: z.string().min(6, 'Teléfono requerido'),
  country_code: z.string().default('+54'),
  name: z.string().min(1, 'Nombre requerido'),
  propertyId: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  accountType: z.number().nullable().optional(),
});

export type TruoraOutboundPayload = z.infer<typeof truoraOutboundSchema>;
