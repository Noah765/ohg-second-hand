import db from '$lib/server/db.js';

export async function load({ params }) {
	const user = await db.authUser.findUnique({ where: { id: params.id }, select: { name: true } });

	return {
		otherUser: user,
		otherUserOfferCount: user ? await db.offers.count({ where: { creator_id: params.id, hidden: false } }) : null
	};
}
