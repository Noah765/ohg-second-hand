import db from '$lib/server/db';

export async function load({ url }) {
	const query = url.searchParams.get('q');
	const rawSort = url.searchParams.get('sort');
	const rawCategories = url.searchParams.get('categories');
	const rawPage = url.searchParams.get('page');

	const categories = getCategories(rawCategories);
	const orderBy = getOrderBy(rawSort);
	const offset = getOffset(rawPage);

	let offerSql =
		'SELECT offers.id, offers.created_at, users.id as creator_id, users.name as creator_name, offers.title, offers.images, offers.description, offers.category, offers.price, offers.price_type FROM offers INNER JOIN users ON users.id = offers.creator_id WHERE hidden = false';
	let countSql = 'SELECT COUNT(*) FROM offers';

	const where = [];
	if (categories) where.push(`category IN (${categories.join(', ')})`);

	const queryParam = [];
	if (query) {
		where.push("ts @@ websearch_to_tsquery('german', $1)");
		queryParam.push(query);
	}

	if (where.length !== 0) {
		const sqlWhere = ` AND ${where.join(' AND ')}`;
		offerSql += sqlWhere;
		countSql += sqlWhere;
	}

	offerSql += ` ORDER BY ${orderBy} LIMIT 10`;

	if (offset) offerSql += ` OFFSET ${offset}`;

	const offers = await db.$queryRawUnsafe<
		{
			id: string;
			created_at: Date;
			creator_id: string;
			creator_name: string;
			title: string;
			images: string[] | null;
			description: string | null;
			category: number;
			price: number | null;
			price_type: boolean | null;
		}[]
	>(offerSql, ...queryParam);
	const count = await db.$queryRawUnsafe<[{ count: bigint }]>(countSql, ...queryParam);

	return {
		count: Number(count[0].count),
		offers: offers.map((e) => ({
			id: e.id,
			created_at: e.created_at,
			creator: { id: e.creator_id, name: e.creator_name },
			title: e.title,
			images: e.images,
			description: e.description,
			category: e.category,
			price: e.price,
			price_type: e.price_type
		}))
	};
}

function getCategories(categories: string | null) {
	if (!categories) return;

	const result = new Set<number>();
	const splitted = categories.split('-');

	splitted.forEach((e) => {
		const number = parseInt(e);
		if (number >= 0 && number <= 8) result.add(number);
	});

	return result.size !== 0 ? Array.from(result) : undefined;
}

const fields = ['created_at', 'price', 'title'];
function getOrderBy(order: string | null) {
	if (!order || !order.includes('-')) return 'created_at DESC';

	const splitted = order.split('-');
	const field = splitted[0];
	const direction = splitted[1];

	if (!fields.includes(field) || (direction !== 'ASC' && direction !== 'DESC')) return 'created_at DESC';

	return `${field} ${direction}`;
}

function getOffset(page: string | null) {
	if (!page) return;

	const number = Number(page);
	if (isNaN(number) || number < 1) return;
	return (number - 1) * 10;
}
