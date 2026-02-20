import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient(supabaseUrl: string, supabaseKey: string) {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}
