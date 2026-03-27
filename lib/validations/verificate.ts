import { z } from 'zod';

export const verificateFormSchema = z.object({
  name: z.string().min(1, 'Ingresá tu nombre'),
  phone: z.string().min(6, 'Ingresá tu teléfono'),
  country_code: z.string().default('+54'),
});

export type VerificateFormValues = z.infer<typeof verificateFormSchema>;
