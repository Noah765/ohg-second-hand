import db from '$lib/server/db.js';

export async function load({ parent }) {
	const { user } = await parent();
	return {
		offers: user
			? await db.offers.findMany({
					where: { creator_id: user.id },
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
			: null
	};
}
