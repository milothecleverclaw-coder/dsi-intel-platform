import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// For queries
const queryClient = postgres(process.env.DATABASE_URL, { ssl: 'require' });
export const db = drizzle(queryClient);

// For migrations (separate client with different options)
export const migrationClient = postgres(process.env.DATABASE_URL, { 
  ssl: 'require', 
  max: 1 
});
