import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export type Message = {
	id: number;
	receiver: string;
	created_at: string;
	message: string | null;
	images: string[] | null;
};

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase, chats, user } = await parent();

	if (!user) return;

	if (!chats) throw redirect(303, '/chat');
	if (!chats.find((chat) => String(chat.id) === params.id)) throw redirect(303, `/chat/${chats[0].id}`);

	const { data: messages, error: supabaseError } = await supabase
		.from('messages')
		.select('id, receiver, created_at, message, images')
		.eq('chat', params.id)
		.order('created_at', { ascending: false })
		.limit(10)
		.returns<Message[]>();
	if (supabaseError) throw error(500, supabaseError);

	return { messages };
};
