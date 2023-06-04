import { SUPABASE_SERVICE_ROLE } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from './supabase_types';
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
	auth: { autoRefreshToken: false, persistSession: false }
});
