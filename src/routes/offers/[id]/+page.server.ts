import db from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	async bookmark({ params, locals }) {
		const session = await locals.auth.validate();
		if (!session) return fail(401);

		const offer = await db.offers.findUnique({ where: { id: params.id }, select: { creator_id: true } });
		if (!offer || offer.creator_id === session.userId) return fail(400);

		const bookmark = await db.bookmarks.findFirst({
			where: { offer_id: params.id, user_id: session.userId },
			select: { id: true }
		});

		if (bookmark) await db.bookmarks.delete({ where: { id: bookmark.id } });
		else await db.bookmarks.create({ data: { offer_id: params.id, user_id: session.userId } });
	},
	async delete({ params, locals }) {
		const session = await locals.auth.validate();
		if (!session) return fail(401, { error: 'Gültiges Authentifizierungs-Token wird benötigt' });

		await db.offers.deleteMany({ where: { id: params.id, creator_id: session.userId } });

		throw redirect(303, '/shop');
	}
};
