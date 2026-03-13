import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/trpc';
import { pins } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import {
  createPinInputSchema,
  updatePinInputSchema,
  listPinsInputSchema,
  deletePinInputSchema,
  pinIdSchema,
} from '@/lib/schemas/pin';

/**
 * Helper to transform Drizzle result to API format (camelCase -> snake_case)
 */
function transformPinToApi(pin: typeof pins.$inferSelect): {
  pin_id: string;
  case_id: string | null;
  evidence_id: string | null;
  pin_type: 'document' | 'video' | 'audio' | '';
  timestamp_start: string | null;
  timestamp_end: string | null;
  incident_time: string | null;
  incident_date: string | null;
  context: string;
  importance: 'low' | 'medium' | 'high' | '';
  tagged_personas: string[];
  ai_context_data: Record<string, any>;
  notes: string | null;
  pinned_at: string;
} {
  return {
    pin_id: pin.pinId,
    case_id: pin.caseId,
    evidence_id: pin.evidenceId,
    pin_type: (pin.pinType as 'document' | 'video' | 'audio') || 'document',
    timestamp_start: pin.timestampStart,
    timestamp_end: pin.timestampEnd,
    incident_time: pin.incidentTime?.toISOString() ?? null,
    incident_date: pin.incidentDate?.toISOString() ?? null,
    context: pin.context || '',
    importance: (pin.importance as 'low' | 'medium' | 'high') || 'medium',
    tagged_personas: (pin.taggedPersonas as string[]) || [],
    ai_context_data: (pin.aiContextData as Record<string, any>) || {},
    notes: pin.notes,
    pinned_at: pin.pinnedAt?.toISOString() ?? new Date().toISOString(),
  };
}

/**
 * Pin Router
 * 
 * Type-safe tRPC router for pin operations.
 * Replaces the REST API routes with full type safety.
 */
export const pinRouter = createTRPCRouter({
  /**
   * List all pins for a case
   */
  list: publicProcedure
    .input(listPinsInputSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { caseId } = input;

      const results = await db
        .select()
        .from(pins)
        .where(eq(pins.caseId, caseId))
        .orderBy(desc(pins.pinnedAt));

      return results.map(transformPinToApi);
    }),

  /**
   * Get a single pin by ID
   */
  getById: publicProcedure
    .input(z.object({ pinId: pinIdSchema }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { pinId } = input;

      const results = await db
        .select()
        .from(pins)
        .where(eq(pins.pinId, pinId))
        .limit(1);

      if (results.length === 0) {
        return null;
      }

      return transformPinToApi(results[0]);
    }),

  /**
   * Create a new pin
   */
  create: publicProcedure
    .input(createPinInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Generate pin_id using the sequence
      const seqResult = await db.execute(
        sql`SELECT nextval('pin_sequence'::regclass) as seq`
      );
      const seqNum = (seqResult[0] as { seq: number }).seq;
      const pinId = `P${seqNum.toString().padStart(3, '0')}`;

      // Insert the pin
      const insertResult = await db
        .insert(pins)
        .values({
          pinId,
          caseId: input.case_id,
          evidenceId: input.evidence_id || null,
          pinType: input.pin_type,
          timestampStart: input.timestamp_start || null,
          timestampEnd: input.timestamp_end || null,
          incidentTime: input.incident_time ? new Date(input.incident_time) : null,
          incidentDate: input.incident_date ? new Date(input.incident_date) : null,
          context: input.context,
          importance: input.importance,
          taggedPersonas: input.tagged_personas,
          aiContextData: input.ai_context_data,
          notes: input.notes || null,
        })
        .returning();

      return transformPinToApi(insertResult[0]);
    }),

  /**
   * Update an existing pin
   */
  update: publicProcedure
    .input(
      z.object({
        pinId: pinIdSchema,
        data: updatePinInputSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { pinId, data } = input;

      // Build update object with only provided fields
      const updateData: Partial<typeof pins.$inferInsert> = {};
      if (data.context !== undefined) updateData.context = data.context;
      if (data.tagged_personas !== undefined) updateData.taggedPersonas = data.tagged_personas;
      if (data.incident_date !== undefined) {
        updateData.incidentDate = data.incident_date ? new Date(data.incident_date) : null;
      }
      if (data.importance !== undefined) updateData.importance = data.importance;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const updateResult = await db
        .update(pins)
        .set(updateData)
        .where(eq(pins.pinId, pinId))
        .returning();

      if (updateResult.length === 0) {
        throw new Error('Pin not found');
      }

      return transformPinToApi(updateResult[0]);
    }),

  /**
   * Delete a pin
   */
  delete: publicProcedure
    .input(deletePinInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { pinId } = input;

      await db.delete(pins).where(eq(pins.pinId, pinId));

      return { success: true };
    }),
});
