import { pgTable, foreignKey, varchar, uuid, timestamp, text, jsonb, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const pinSequence = pgSequence("pin_sequence", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const pins = pgTable("pins", {
	pinId: varchar("pin_id", { length: 10 }).primaryKey().notNull(),
	caseId: uuid("case_id"),
	evidenceId: uuid("evidence_id"),
	pinType: varchar("pin_type", { length: 20 }),
	timestampStart: varchar("timestamp_start", { length: 20 }),
	timestampEnd: varchar("timestamp_end", { length: 20 }),
	incidentTime: timestamp("incident_time", { withTimezone: true, mode: 'string' }),
	context: text(),
	importance: varchar({ length: 10 }).default('medium'),
	taggedPersonas: uuid("tagged_personas").array().default([""]),
	aiContextData: jsonb("ai_context_data").default({}),
	pinnedAt: timestamp("pinned_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	notes: text(),
	incidentDate: timestamp("incident_date", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.caseId],
			foreignColumns: [cases.caseId],
			name: "pins_case_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.evidenceId],
			foreignColumns: [evidence.evidenceId],
			name: "pins_evidence_id_fkey"
		}),
]);

export const personaPhotos = pgTable("persona_photos", {
	photoId: uuid("photo_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	personaId: uuid("persona_id"),
	imageUrl: text("image_url").notNull(),
	twelveLabsEntityId: text("twelve_labs_entity_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.personaId],
			foreignColumns: [personas.personaId],
			name: "persona_photos_persona_id_fkey"
		}).onDelete("cascade"),
]);

export const personas = pgTable("personas", {
	personaId: uuid("persona_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	caseId: uuid("case_id"),
	firstNameTh: varchar("first_name_th", { length: 100 }),
	lastNameTh: varchar("last_name_th", { length: 100 }),
	firstNameEn: varchar("first_name_en", { length: 100 }),
	lastNameEn: varchar("last_name_en", { length: 100 }),
	aliases: jsonb().default([]),
	phones: jsonb().default([]),
	role: varchar({ length: 50 }).default('suspect'),
	distinctiveFeatures: text("distinctive_features"),
	metadata: jsonb().default({}),
	photos: jsonb().default([]),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.caseId],
			foreignColumns: [cases.caseId],
			name: "personas_case_id_fkey"
		}).onDelete("cascade"),
]);

export const cases = pgTable("cases", {
	caseId: uuid("case_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	caseNumber: varchar("case_number", { length: 50 }),
	title: varchar({ length: 200 }).notNull(),
	narrativeReport: text("narrative_report"),
	status: varchar({ length: 20 }).default('active'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	caseNarrative: text("case_narrative"),
	twelveLabsIndexId: text("twelve_labs_index_id"),
});

export const evidence = pgTable("evidence", {
	evidenceId: uuid("evidence_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	caseId: uuid("case_id"),
	filename: varchar({ length: 255 }).notNull(),
	displayName: varchar("display_name", { length: 200 }),
	fileType: varchar("file_type", { length: 20 }),
	blobPath: text("blob_path"),
	metadata: jsonb().default({}),
	azureAnalysis: jsonb("azure_analysis"),
	twelveLabsIndexId: text("twelve_labs_index_id"),
	uploadedAt: timestamp("uploaded_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	extractedText: text("extracted_text"),
	twelveLabsVideoId: text("twelve_labs_video_id"),
	indexingTaskId: text("indexing_task_id"),
	indexingError: text("indexing_error"),
}, (table) => [
	foreignKey({
			columns: [table.caseId],
			foreignColumns: [cases.caseId],
			name: "evidence_case_id_fkey"
		}).onDelete("cascade"),
]);
