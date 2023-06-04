import { redirect } from '@sveltejs/kit';

export async function load({ parent, params }) {
	const { session, offer } = await parent();
	if (!session || !offer || session.user.id !== offer.creator.id) throw redirect(303, `/offers/${params.id}`);
}
