/** JSON-safe boundary for Supabase RPC parameters; game state is validated separately. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
