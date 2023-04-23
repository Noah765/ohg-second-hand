import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	const { user } = await parent();
	if (user) throw redirect(303, '/create');
}
