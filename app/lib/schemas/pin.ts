import { z } from 'zod';

// Pin ID schema (P001, P002, etc.)
export const pinIdSchema = z.string().regex(/^P\d{3}$/);

// UUID schema
export const uuidSchema = z.string().uuid();

// Pin importance levels
export const pinImportanceSchema = z.enum(['low', 'medium', 'high']);

// Pin types
export const pinTypeSchema = z.enum(['document', 'video', 'audio']);

// ISO datetime string - simple string with validation
const isoDateTimeString = () => z.string().refine(
  (val) => {
    if (!val) return true; // Allow null/undefined to be handled by nullish()
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid ISO datetime string' }
);

// JSON object schema - for ai_context_data
const jsonObjectSchema = () => z.record(z.string(), z.unknown());

// Create Pin Input Schema
export const createPinInputSchema = z.object({
  case_id: uuidSchema,
  evidence_id: uuidSchema.nullish(),
  pin_type: pinTypeSchema,
  timestamp_start: z.string().nullish(),
  timestamp_end: z.string().nullish(),
  incident_time: isoDateTimeString().nullish(),
  incident_date: isoDateTimeString().nullish(),
  context: z.string().min(1, 'Context is required'),
  importance: pinImportanceSchema.default('medium'),
  tagged_personas: z.array(uuidSchema).default([]),
  ai_context_data: jsonObjectSchema().default({}),
  notes: z.string().nullish(),
});

// Update Pin Input Schema
export const updatePinInputSchema = z.object({
  context: z.string().optional(),
  tagged_personas: z.array(uuidSchema).optional(),
  incident_date: isoDateTimeString().nullish(),
  importance: pinImportanceSchema.optional(),
  notes: z.string().nullish(),
});

// Pin Output Schema - matches Drizzle schema (camelCase internally, snake_case for API)
// All fields that can be null in DB are nullable here with defaults handled in transform
export const pinOutputSchema = z.object({
  pin_id: pinIdSchema,
  case_id: uuidSchema.nullish(),
  evidence_id: uuidSchema.nullish(),
  pin_type: z.union([pinTypeSchema, z.literal(''), z.null()]).default('document'),
  timestamp_start: z.string().nullish().default(null),
  timestamp_end: z.string().nullish().default(null),
  incident_time: isoDateTimeString().nullish().default(null),
  incident_date: isoDateTimeString().nullish().default(null),
  context: z.string().default(''),
  importance: z.union([pinImportanceSchema, z.literal(''), z.null()]).default('medium'),
  tagged_personas: z.array(uuidSchema).default([]),
  ai_context_data: jsonObjectSchema().default({}),
  notes: z.string().nullish().default(null),
  pinned_at: isoDateTimeString(),
});

// List Pins Input Schema
export const listPinsInputSchema = z.object({
  caseId: uuidSchema,
});

// Delete Pin Input Schema
export const deletePinInputSchema = z.object({
  pinId: pinIdSchema,
});

// TypeScript types inferred from Zod schemas
export type CreatePinInput = z.infer<typeof createPinInputSchema>;
export type UpdatePinInput = z.infer<typeof updatePinInputSchema>;
export type PinOutput = z.infer<typeof pinOutputSchema>;
export type ListPinsInput = z.infer<typeof listPinsInputSchema>;
export type DeletePinInput = z.infer<typeof deletePinInputSchema>;
