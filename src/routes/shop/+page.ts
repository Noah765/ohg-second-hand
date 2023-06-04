import { error } from '@sveltejs/kit';

type Offers = {
	id: string;
	creator: {
		id: string;
		name: string;
	};
	created_at: string;
	title: string;
	images: string[] | null;
	description: string | null;
	category: number;
	price: number | null;
	price_fixed: boolean | null;
}[];

export async function load({ parent, url }) {
	const { supabase } = await parent();

	let request = supabase
		.from('offers')
		.select('id, creator(id, name), created_at, title, images, description, category, price, price_fixed', {
			count: 'exact'
		})
		.eq('hidden', false)
		.order(...getOrderBy(url.searchParams.get('sort')));

	const query = url.searchParams.get('q');
	if (query) request = request.textSearch('ts', query, { type: 'websearch', config: 'german' });

	const categories = url.searchParams.get('categories');
	if (categories) {
		request = request.in(
			'category',
			categories.split('-').map((category) => parseInt(category))
		);
	}

	const page = getPage(url.searchParams.get('page'));
	if (page) request = request.range(...page);
	else request = request.limit(10);

	const { data: offers, count, error: supabaseError } = await request.returns<Offers>();

	if (supabaseError) throw error(500, supabaseError);

	return { offers, count: count as number };
}

const fields = ['created_at', 'price', 'title'];
function getOrderBy(order: string | null): ['created_at' | 'price' | 'title', { ascending: boolean }] {
	if (!order || !order.includes('-')) return ['created_at', { ascending: false }];

	const splitted = order.split('-');
	const field = splitted[0];
	const direction = splitted[1];

	if (!fields.includes(field)) return ['created_at', { ascending: false }];

	return [field as 'created_at' | 'price' | 'title', { ascending: direction === 'ASC' }];
}

function getPage(page: string | null): [number, number] | undefined {
	if (!page) return;

	const number = parseInt(page);
	if (isNaN(number) || number < 1) return;
	return [(number - 1) * 10, number * 10 - 1];
}
