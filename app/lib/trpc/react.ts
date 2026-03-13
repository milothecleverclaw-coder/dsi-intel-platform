/**
 * tRPC React Hooks
 * 
 * This file creates the React hooks for using tRPC in client components.
 * Follows the T3 Stack pattern.
 */
'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
