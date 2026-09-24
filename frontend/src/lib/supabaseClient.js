import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev rather than silently making requests that 401.
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Create frontend/.env.local with these values (see README).'
  )
}

// NOTE: only the anon (public) key is ever used in the frontend.
// The SUPABASE_SERVICE_ROLE_KEY must never appear in any frontend file.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
