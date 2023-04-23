import db from '$lib/server/db';

export async function load({ params, parent }) {
	const offer = await db.offers.findUnique({
		where: { id: params.id },
		select: {
			created_at: true,
			hidden: true,
			creator: { select: { id: true, name: true } },
			title: true,
			images: true,
			description: true,
			category: true,
			price: true,
			price_type: true
		}
	});

	const { user } = await parent();
	const bookmark =
		!user || !offer || user.id === offer.creator.id
			? null
			: await db.bookmarks.findFirst({ where: { offer_id: params.id, user_id: user.id }, select: null });

	return { bookmark: bookmark ? true : false, offer };
}
