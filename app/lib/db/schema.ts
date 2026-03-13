import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, serial } from 'drizzle-orm/pg-core';

// Cases table
export const cases = pgTable('cases', {
  caseId: uuid('case_id').primaryKey().defaultRandom(),
  caseNumber: varchar('case_number', { length: 50 }),
  title: varchar('title', { length: 200 }).notNull(),
  narrativeReport: text('narrative_report'),
  caseNarrative: text('case_narrative'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  twelveLabsIndexId: text('twelve_labs_index_id'),
});

// Evidence table
export const evidence = pgTable('evidence', {
  evidenceId: uuid('evidence_id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => cases.caseId, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 200 }),
  fileType: varchar('file_type', { length: 20 }),
  blobPath: text('blob_path'),
  metadata: jsonb('metadata').default({}),
  azureAnalysis: jsonb('azure_analysis'),
  twelveLabsIndexId: text('twelve_labs_index_id'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow(),
  extractedText: text('extracted_text'),
  twelveLabsVideoId: text('twelve_labs_video_id'),
  indexingTaskId: text('indexing_task_id'),
  indexingError: text('indexing_error'),
});

// Personas table
export const personas = pgTable('personas', {
  personaId: uuid('persona_id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => cases.caseId, { onDelete: 'cascade' }),
  firstNameTh: varchar('first_name_th', { length: 100 }),
  lastNameTh: varchar('last_name_th', { length: 100 }),
  firstNameEn: varchar('first_name_en', { length: 100 }),
  lastNameEn: varchar('last_name_en', { length: 100 }),
  aliases: jsonb('aliases').default([]),
  phones: jsonb('phones').default([]),
  role: varchar('role', { length: 50 }).default('suspect'),
  distinctiveFeatures: text('distinctive_features'),
  metadata: jsonb('metadata').default({}),
  photos: jsonb('photos').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  notes: text('notes'),
  twelveLabsCollectionId: text('twelve_labs_collection_id'),
});

// Persona Photos table
export const personaPhotos = pgTable('persona_photos', {
  photoId: uuid('photo_id').primaryKey().defaultRandom(),
  personaId: uuid('persona_id').references(() => personas.personaId, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  twelveLabsEntityId: text('twelve_labs_entity_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Pins table
export const pins = pgTable('pins', {
  pinId: varchar('pin_id', { length: 10 }).primaryKey(),
  caseId: uuid('case_id').references(() => cases.caseId, { onDelete: 'cascade' }),
  evidenceId: uuid('evidence_id').references(() => evidence.evidenceId),
  pinType: varchar('pin_type', { length: 20 }),
  timestampStart: varchar('timestamp_start', { length: 20 }),
  timestampEnd: varchar('timestamp_end', { length: 20 }),
  incidentTime: timestamp('incident_time', { withTimezone: true }),
  incidentDate: timestamp('incident_date', { withTimezone: true }),
  context: text('context'),
  importance: varchar('importance', { length: 10 }).default('medium'),
  taggedPersonas: jsonb('tagged_personas').default([]),
  aiContextData: jsonb('ai_context_data').default({}),
  pinnedAt: timestamp('pinned_at', { withTimezone: true }).defaultNow(),
  notes: text('notes'),
});

// Pin sequence for generating pin IDs
export const pinSequence = pgTable('pin_sequence', {
  id: serial('id').primaryKey(),
});

// Types for TypeScript
export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;

export type Evidence = typeof evidence.$inferSelect;
export type NewEvidence = typeof evidence.$inferInsert;

export type Persona = typeof personas.$inferSelect;
export type NewPersona = typeof personas.$inferInsert;

export type PersonaPhoto = typeof personaPhotos.$inferSelect;
export type NewPersonaPhoto = typeof personaPhotos.$inferInsert;

export type Pin = typeof pins.$inferSelect;
export type NewPin = typeof pins.$inferInsert;
