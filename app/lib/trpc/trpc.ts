import { initTRPC } from '@trpc/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import superjson from 'superjson';

// Create PostgreSQL client for tRPC context
const queryClient = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
export const db = drizzle(queryClient);

/**
 * 1. CONTEXT
 * 
 * Define the context for each tRPC request. This includes the database connection.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 * 
 * Initialize tRPC with the context.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

/**
 * 3. ROUTER & PROCEDURE
 * 
 * Export reusable router and procedure helpers.
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
