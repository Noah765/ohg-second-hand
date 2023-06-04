import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/server/supabase_types.js';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { error } from '@sveltejs/kit';

type User = {
	id: string;
	name: string;
	admin?: true;
	blocked_until?: number;
	block_description?: string;
};

export async function load({ fetch, data: { session }, depends }) {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient<Database>({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: session
	});

	let user: User | null = null;
	if (session) {
		const { data, error: supabaseError } = (await supabase.rpc('get_user')) as PostgrestSingleResponse<{
			id: string;
			name: string;
			admin?: true;
			blocked_until?: number;
			block_description?: string;
		}>;
		if (supabaseError) throw error(500, supabaseError);

		user = data;
	}

	return { supabase, session, user };
}
