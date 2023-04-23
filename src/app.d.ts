import { Auth as LuciaAuth } from '$lib/server/auth';
import { SupabaseClient, Session } from '@supabase/supabase-js';
import type { AuthRequest } from 'lucia-auth';

declare global {
	namespace Lucia {
		type Auth = LuciaAuth;
		interface UserAttributes {
			name: string;
			email: string;
			email_verified: boolean;
		}
	}

	namespace App {
		// interface Error {}
		interface Locals {
			auth: AuthRequest;
			supabase: SupabaseClient;
			getSession(): Promise<Session | null>;
		}
		// interface PageData {}
		// interface Platform {}
	}
}
