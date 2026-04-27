import { z } from 'zod';

export const truoraOutboundSchema = z.object({
  phone: z.string().min(6, 'Teléfono requerido'),
  country_code: z.string().default('+54'),
  name: z.string(),
  propertyId: z.string().nullish(),
  date: z.string().nullish(),
  time: z.string().nullish(),
  accountType: z.number().nullable().optional(),
  /** When true, use the certificate-specific outbound template. */
  certificado: z.boolean().optional(),
});

export type TruoraOutboundPayload = z.infer<typeof truoraOutboundSchema>;
