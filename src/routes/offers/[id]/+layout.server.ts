import { error } from '@sveltejs/kit';

type Offer = {
	id: string;
	bookmark: boolean;
	report: boolean;
	chat_id: number | null;
	creator: { id: string; name: string; blocked?: true };
	created_at: string;
	hidden: boolean;
	title: string;
	images: string[] | null;
	description: string | null;
	category: number;
	price: number | null;
	price_fixed: boolean | null;
};

export async function load({ locals: { supabase }, params, depends }) {
	depends('supabase:offer');

	const { data: offer, error: supabaseError } = await supabase
		.from('offers')
		.select(
			'id, bookmarks(id), offer_reports(id), my_chats(id), creator(id, name), created_at, hidden, title, images, description, category, price, price_fixed'
		)
		.eq('id', params.id)
		.limit(1, { foreignTable: 'my_chats' })
		.limit(1, { foreignTable: 'offer_reports' })
		.maybeSingle<
			Offer & { bookmarks: { id: number }[]; offer_reports: { id: number }[]; my_chats: { id: number }[] }
		>();

	if (supabaseError) throw error(500, supabaseError);

	if (offer) {
		const { data: blocked, error: supabaseError } = await supabase.rpc('is_blocked', { user_id: offer.creator.id });

		if (supabaseError && supabaseError.message !== 'unauthorized') throw error(500, supabaseError);
		if (blocked) offer.creator.blocked = true;

		offer.bookmark = offer.bookmarks.length > 0;
		// @ts-expect-error The bookmarks prop should be deleted
		delete offer.bookmarks;
		offer.report = offer.offer_reports.length > 0;
		// @ts-expect-error The offer_reports prop should be deleted
		delete offer.offer_reports;
		offer.chat_id = offer.my_chats.length > 0 ? offer.my_chats[0].id : null;
		// @ts-expect-error The chats prop should be deleted
		delete offer.my_chats;
	}

	return { offer: offer as Offer | null };
}
