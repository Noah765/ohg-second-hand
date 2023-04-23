import db from '$lib/server/db.js';
import schema from '$lib/server/schema';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ parent, params }) {
	const data = await parent();
	if (!data.user || data.user.id !== data.offer?.creator.id) throw redirect(303, `/offers/${params.id}`);
}

const offerSchema = schema.form({
	hidden: schema.boolean({ name: 'Versteckt' }),
	title: schema.string({ name: 'Titel' }),
	description: schema.string({ name: 'Beschreibung' }, { required: false }),
	category: schema.number({ name: 'Kategorie' }).int().min(0).max(8),
	price: schema.number({ name: 'Preis' }, { required: false }).step(0.01).min(0.01).max(999.99),
	priceType: schema.number({ name: 'Preisart' }).int().min(0).max(2)
});
export const actions = {
	async default({ request, locals, params }) {
		const result = await schema.check<{
			hidden: boolean;
			title: string;
			description?: string;
			category: number;
			price?: number;
			priceType: number;
		}>({
			request,
			schema: offerSchema
		});
		if (result.error) return result.error;

		const session = await locals.auth.validate();
		if (!session) return fail(401, { error: 'Gültiges Authentifizierungs-Token wird benötigt' });

		const { hidden, title, description, category, price, priceType } = result.data;

		if (price && priceType === 0) return fail(400, { error: 'Die Preisart muss angegeben werden' });
		if (!price && priceType !== 0) return fail(400, { error: 'Der Preis muss angegeben werden' });

		const price_type = priceType === 0 ? undefined : priceType === 1 ? true : false;
		const offerId = params.id;

		await db.offers.updateMany({
			where: { id: offerId, creator_id: session.userId },
			data: { hidden, title, description, category, price, price_type }
		});

		throw redirect(303, `/offers/${offerId}`);
	}
};
