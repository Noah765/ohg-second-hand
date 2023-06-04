import { error } from '@sveltejs/kit';

type Offer = {
	id: string;
	created_at: string;
	title: string;
	images: string[] | null;
	description: string | null;
	category: number;
	price: number | null;
	price_fixed: boolean | null;
};

export async function load({ parent, params }) {
	const { supabase } = await parent();

	const { data: offers, error: supabaseError } = await supabase
		.from('offers')
		.select('id, created_at, title, images, description, category, price, price_fixed')
		.eq('creator', params.id)
		.returns<Offer[]>();
	if (supabaseError) throw error(500, supabaseError);

	return { offers };
}
