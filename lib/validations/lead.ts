import { z } from 'zod';

export const leadFormSchema = z.object({
  name: z.string().min(1, 'Ingresá tu nombre'),
  email: z.string().email('Ingresá un email válido'),
  phone: z.string().optional(),
  country_code: z.string().default('+54'),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const leadApiSchema = z.object({
  propertyId: z.number(),
  type: z.enum(['visita', 'reserva']),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  country_code: z.string().optional().default('+54'),
  message: z.string().min(1),
  source: z.enum(['web', 'whatsapp']).default('web'),
  submitterUserId: z.string().uuid().optional(),
});

export type LeadApiInput = z.infer<typeof leadApiSchema>;
