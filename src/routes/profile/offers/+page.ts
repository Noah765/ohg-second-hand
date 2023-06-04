import { error } from '@sveltejs/kit';

type Offer = {
	id: string;
	created_at: string;
	hidden: boolean;
	title: string;
	images: string[] | null;
	description: string | null;
	category: number;
	price: number | null;
	price_fixed: boolean | null;
};

export async function load({ parent }) {
	const { supabase, user } = await parent();

	if (!user) return { offers: null };

	const { data: offers, error: supabaseError } = await supabase
		.from('offers')
		.select('id, created_at, hidden, title, images, description, category, price, price_fixed')
		.eq('creator', user.id)
		.returns<Offer[]>();

	if (supabaseError) throw error(500, supabaseError);

	return { offers };
}
