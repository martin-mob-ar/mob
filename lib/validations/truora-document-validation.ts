import { z } from 'zod';

export const truoraDocumentValidationSchema = z.object({
  phone: z.string().min(6, 'Teléfono requerido'),
  status: z.string(),                         // "success" = document validated
  validation_id: z.string().optional(),        // Truora VLD... ID
  document_number: z.string().optional(),
  name: z.string().optional(),
  last_name: z.string().optional(),
  gender: z.string().optional(),               // "male", "female"
  document_type: z.string().optional(),        // "national-id", "passport", etc.
  date_of_birth: z.string().optional(),
});

export type TruoraDocumentValidationPayload = z.infer<typeof truoraDocumentValidationSchema>;
