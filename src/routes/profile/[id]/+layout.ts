import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { error } from '@sveltejs/kit';

export async function load({ parent, params }) {
	const { supabase, user } = await parent();

	let otherUser: { name: string; blocked_until?: number; block_description?: string } | null;
	if (user?.admin) {
		const { data, error: otherUserError } = (await supabase.rpc('get_other_user', {
			user_id: params.id
		})) as PostgrestSingleResponse<{ name: string; blocked_until?: number; block_description?: string }>;
		if (otherUserError) throw error(500, otherUserError);
		if (data.blocked_until === undefined || data.blocked_until < new Date().valueOf()) otherUser = { name: data.name };
		else otherUser = data;
	} else {
		const { data, error: otherUserError } = await supabase
			.from('users')
			.select('name')
			.eq('id', params.id)
			.maybeSingle();
		if (otherUserError) throw error(500, otherUserError);
		otherUser = data;
	}

	let otherUserOfferCount = 0;
	if (otherUser) {
		const { count, error: otherUserOfferCountError } = await supabase
			.from('offers')
			.select('*', { count: 'exact', head: true })
			.eq('creator', params.id);

		if (otherUserOfferCountError) throw error(500, otherUserOfferCountError);
		otherUserOfferCount = count as number;
	}

	return { otherUser, otherUserOfferCount };
}
