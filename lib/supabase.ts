import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This file should be consolidated with lib/supabase/client.ts to avoid duplication.
// Move any unique functionality from this file to lib/supabase/client.ts
// Then consider deleting this file or making it re-export from the client.ts file

// Example of re-export:
// Re-export from the client file to maintain backward compatibility
export * from './supabase/client';
