import { z } from 'zod';

// Step 1: Principales
export const stepPrincipalesSchema = z.object({
  type_id: z.number({ required_error: 'Seleccioná el tipo de propiedad' }),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0').optional(),
  currency: z.string().optional(),
});

// Step 2: Ubicación
export const stepUbicacionSchema = z.object({
  address: z.string().min(1, 'Ingresá la dirección'),
  geo_lat: z.string().min(1, 'Debes seleccionar una dirección del autocompletado de Google Maps'),
  geo_long: z.string().min(1, 'Debes seleccionar una dirección del autocompletado de Google Maps'),
  location_id: z.number({ required_error: 'Seleccioná un barrio o localidad' }),
});

// Step 3: Características (at least some fields)
export const stepCaracteristicasSchema = z.object({
  room_amount: z.number().int().min(0).optional().nullable(),
  bathroom_amount: z.number().int().min(0).optional().nullable(),
  toilet_amount: z.number().int().min(0).optional().nullable(),
  suite_amount: z.number().int().min(0).optional().nullable(),
  parking_lot_amount: z.number().int().min(0).optional().nullable(),
  total_surface: z.string().optional().nullable(),
  roofed_surface: z.string().optional().nullable(),
  semiroofed_surface: z.string().optional().nullable(),
  unroofed_surface: z.string().optional().nullable(),
  age: z.number().int().min(0).optional().nullable(),
  floors_amount: z.number().int().min(0).optional().nullable(),
});

// Step 4: Multimedia
export const stepMultimediaSchema = z.object({
  photoUrls: z.array(z.string().url().or(z.literal(''))).optional(),
  videoUrls: z.array(z.string().url().or(z.literal(''))).optional(),
});

// Step 5: Extras
export const stepExtrasSchema = z.object({
  tagIds: z.array(z.number()).optional(),
  description: z.string().optional().nullable(),
  rich_description: z.string().optional().nullable(),
  publication_title: z.string().optional().nullable(),
  reference_code: z.string().optional().nullable(),
});

// Step 6: Logistics
export const stepLogisticsSchema = z.object({
  available_date: z.string().optional().nullable(),
  key_coordination: z.string().optional().nullable(),
  visit_days: z.array(z.string()).optional().nullable(),
  visit_hours: z.array(z.string()).optional().nullable(),
});

// Full form schema (all steps)
export const addPropertyFormSchema = z.object({
  // Step 1
  type_id: z.number({ required_error: 'Seleccioná el tipo de propiedad' }),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  expenses: z.number().min(0).optional().nullable(),
  // Step 2 (geo_lat/geo_long required from Google Maps)
  address: z.string().min(1, 'Ingresá la dirección'),
  address_complement: z.string().optional().nullable(),
  geo_lat: z.string().min(1, 'Debes seleccionar una dirección del autocompletado de Google Maps'),
  geo_long: z.string().min(1, 'Debes seleccionar una dirección del autocompletado de Google Maps'),
  location_id: z.number({ required_error: 'Seleccioná un barrio o localidad' }),
  gm_location_type: z.string().optional().nullable(),
  // Step 3
  room_amount: z.number().int().min(0).optional().nullable(),
  bathroom_amount: z.number().int().min(0).optional().nullable(),
  toilet_amount: z.number().int().min(0).optional().nullable(),
  suite_amount: z.number().int().min(0).optional().nullable(),
  parking_lot_amount: z.number().int().min(0).optional().nullable(),
  total_surface: z.string().optional().nullable(),
  roofed_surface: z.string().optional().nullable(),
  semiroofed_surface: z.string().optional().nullable(),
  unroofed_surface: z.string().optional().nullable(),
  age: z.number().int().min(0).optional().nullable(),
  floors_amount: z.number().int().min(0).optional().nullable(),
  disposition: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  apartment_door: z.string().optional().nullable(),
  // Step 4
  photoUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  // Step 5
  tagIds: z.array(z.number()).optional(),
  description: z.string().optional().nullable(),
  rich_description: z.string().optional().nullable(),
  publication_title: z.string().optional().nullable(),
  reference_code: z.string().optional().nullable(),
  // Step 6: Logistics
  available_date: z.string().optional().nullable(),
  key_coordination: z.string().optional().nullable(),
  visit_days: z.array(z.string()).optional().nullable(),
  visit_hours: z.array(z.string()).optional().nullable(),
});

export type AddPropertyFormValues = z.infer<typeof addPropertyFormSchema>;

// Edit schema — relaxed requirements since fields are already populated
export const editPropertyFormSchema = addPropertyFormSchema.extend({
  type_id: z.number().optional(),
  address: z.string().optional(),
  geo_lat: z.string().optional(),
  geo_long: z.string().optional(),
  location_id: z.number().optional(),
  // Operacion fields
  duration_months: z.number().int().min(0).optional().nullable(),
  ipc_adjustment: z.string().optional().nullable(),
});

export type EditPropertyFormValues = z.infer<typeof editPropertyFormSchema>;
