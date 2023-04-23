import db from '$lib/server/db.js';

export async function load({ parent }) {
	const { user } = await parent();
	return {
		offerCount: user ? await db.offers.count({ where: { creator_id: user.id } }) : null,
		bookmarks: user
			? await db.bookmarks.findMany({
					where: { user_id: user.id, offer: { hidden: false } },
					select: {
						offer: {
							select: {
								id: true,
								created_at: true,
								creator: { select: { id: true, name: true } },
								title: true,
								description: true,
								category: true,
								price: true,
								price_type: true
							}
						}
					}
			  })
			: null
	};
}
