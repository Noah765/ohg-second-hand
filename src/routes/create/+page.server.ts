import db from '$lib/server/db.js';
import schema from '$lib/server/schema';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	const { user } = await parent();
	if (!user) throw redirect(303, '/create/logged-out');
}

const offerSchema = schema.form({
	title: schema.string({ name: 'Titel' }),
	description: schema.string({ name: 'Beschreibung' }, { required: false }),
	category: schema.number({ name: 'Kategorie' }).int().min(0).max(8),
	price: schema.number({ name: 'Preis' }, { required: false }).step(0.01).min(0.01).max(999.99),
	priceType: schema.number({ name: 'Preisart' }).int().min(0).max(2)
});
export const actions = {
	async default({ request, locals }) {
		const result = await schema.check<{
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
		if (!session) return fail(401, { error: 'Du must angemeldet sein' });

		const { title, description, category, price, priceType } = result.data;

		if (price && priceType === 0) return fail(400, { error: 'Die Preisart muss angegeben werden' });
		if (!price && priceType !== 0) return fail(400, { error: 'Der Preis muss angegeben werden' });

		const price_type = priceType === 0 ? undefined : priceType === 1 ? true : false;

		await db.offers.create({
			data: { hidden: false, creator_id: session.userId, title, description, category, price, price_type },
			select: null
		});

		throw redirect(303, '/shop');
	}
};
