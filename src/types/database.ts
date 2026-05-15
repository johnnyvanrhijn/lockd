/**
 * Placeholder for Supabase generated database types.
 *
 * Once the schema exists, replace the contents of this file with the
 * output of:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts
 *
 * The shape below keeps the rest of the codebase type-safe in the meantime
 * — `SupabaseClient<Database>` will still compile and any future schema
 * additions slot in without changing call sites.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
