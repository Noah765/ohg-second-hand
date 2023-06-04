export async function load({ locals: { getSession }, depends }) {
	depends('supabase:auth');

	return { session: await getSession() };
}
