import { createClient } from '@supabase/supabase-js'

// This client uses the Service Role key and should ONLY be used in server-side 
// API routes that have already verified admin authorization (e.g. via verifyAdminAuth).
export function createAdminClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
