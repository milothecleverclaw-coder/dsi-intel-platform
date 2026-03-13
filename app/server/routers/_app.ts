/**
 * Main tRPC App Router
 * 
 * Combines all sub-routers into the main application router.
 * Add new routers here as you migrate more features.
 */
import { createTRPCRouter } from '@/lib/trpc/trpc';
import { pinRouter } from './pin';

export const appRouter = createTRPCRouter({
  pin: pinRouter,
  // Add more routers here as you migrate:
  // case: caseRouter,
  // evidence: evidenceRouter,
  // persona: personaRouter,
});

// Export type definition for the API
export type AppRouter = typeof appRouter;
