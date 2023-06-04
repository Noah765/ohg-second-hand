import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	const { chats } = await parent();
	if (chats) throw redirect(303, `/chat/${chats[0].id}`);
}
