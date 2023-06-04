import { error } from '@sveltejs/kit';

export async function load({ parent }) {
	const { supabase } = await parent();

	const { data: offerImages, error: supabaseError } = await supabase
		.from('random_offer_images')
		.select('offer, image')
		.limit(10)
		.returns<{ offer: string; image: string }[]>();
	if (supabaseError) throw error(500, supabaseError);

	return { offerImages };
}
