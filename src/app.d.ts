import type { Database } from '$lib/server/supabase_types';
import { SupabaseClient, Session } from '@supabase/supabase-js';
import type { AuthRequest } from 'lucia-auth';

declare global {
	namespace App {
		interface Error {
			name?: string;
			message: string;
			details?: string;
		}
		interface Locals {
			auth: AuthRequest;
			supabase: SupabaseClient<Database>;
			getSession(): Promise<Session | null>;
		}
		// interface PageData {}
		// interface Platform {}
	}
}
