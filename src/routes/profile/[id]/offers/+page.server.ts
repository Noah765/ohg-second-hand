import db from '$lib/server/db.js';

export async function load({ params }) {
	return {
		offers: await db.offers.findMany({
			where: { creator_id: params.id, hidden: false },
			select: {
				id: true,
				created_at: true,
				title: true,
				description: true,
				category: true,
				price: true,
				price_type: true
			}
		})
	};
}
