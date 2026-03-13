import { relations } from "drizzle-orm/relations";
import { cases, pins, evidence, personas, personaPhotos } from "./schema";

export const pinsRelations = relations(pins, ({one}) => ({
	case: one(cases, {
		fields: [pins.caseId],
		references: [cases.caseId]
	}),
	evidence: one(evidence, {
		fields: [pins.evidenceId],
		references: [evidence.evidenceId]
	}),
}));

export const casesRelations = relations(cases, ({many}) => ({
	pins: many(pins),
	personas: many(personas),
	evidences: many(evidence),
}));

export const evidenceRelations = relations(evidence, ({one, many}) => ({
	pins: many(pins),
	case: one(cases, {
		fields: [evidence.caseId],
		references: [cases.caseId]
	}),
}));

export const personaPhotosRelations = relations(personaPhotos, ({one}) => ({
	persona: one(personas, {
		fields: [personaPhotos.personaId],
		references: [personas.personaId]
	}),
}));

export const personasRelations = relations(personas, ({one, many}) => ({
	personaPhotos: many(personaPhotos),
	case: one(cases, {
		fields: [personas.caseId],
		references: [cases.caseId]
	}),
}));