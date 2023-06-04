import { error } from '@sveltejs/kit';

export type Chat = {
	id: number;
	report: boolean;
	user: { id: string; name: string; blocked?: true };
	offer: {
		id: string;
		creator: { id: string; name: string; blocked?: true };
		hidden: boolean;
		title: string;
	};
};

export async function load({ parent, depends }) {
	depends('layout:data');

	const { supabase, user } = await parent();
	if (!user) return;

	const { data: chats, error: supabaseError } = await supabase
		.from('my_chats')
		.select('id, chat_reports(id), user(id, name), offer(id, creator(id, name), hidden, title)')
		.order('id')
		.limit(1, { foreignTable: 'chat_reports' })
		.returns<(Chat & { chat_reports: { id: number }[] })[]>();

	if (supabaseError) throw error(500, supabaseError);

	const usersBlocked: { id: string; blocked: boolean }[] = [];
	for (const chat of chats) {
		chat.report = chat.chat_reports.length > 0;
		// @ts-expect-error The offer_reports prop should be deleted
		delete chat.chat_reports;

		if (!user.admin) continue;

		const offerCreator = chat.offer.creator.id;
		const offerCreatorBlocked = usersBlocked.find((user) => user.id === offerCreator);

		if (offerCreatorBlocked !== undefined && offerCreatorBlocked.blocked) {
			chat.offer.creator.blocked = true;
		} else if (offerCreatorBlocked === undefined) {
			const { data: offerCreatorBlocked, error: offerCreatorBlockedError } = await supabase.rpc('is_blocked', {
				user_id: offerCreator
			});
			if (offerCreatorBlockedError) throw error(500, offerCreatorBlockedError);

			usersBlocked.push({ id: offerCreator, blocked: offerCreatorBlocked });

			if (offerCreatorBlocked) chat.offer.creator.blocked = true;
		}

		const chatCreator = chat.user.id;
		const chatCreatorBlocked = usersBlocked.find((user) => user.id === chatCreator);

		if (chatCreatorBlocked !== undefined && chatCreatorBlocked.blocked) {
			chat.user.blocked = true;
		} else if (chatCreatorBlocked === undefined) {
			const { data: chatCreatorBlocked, error: chatCreatorBlockedError } = await supabase.rpc('is_blocked', {
				user_id: chatCreator
			});
			if (chatCreatorBlockedError) throw error(500, chatCreatorBlockedError);

			usersBlocked.push({ id: chatCreator, blocked: chatCreatorBlocked });

			if (chatCreatorBlocked) chat.user.blocked = true;
		}
	}

	if (chats.length === 0) return;

	return { chats: chats as Chat[] };
}
