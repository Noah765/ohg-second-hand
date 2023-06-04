import { error } from '@sveltejs/kit';

type Bookmark = {
	offer: {
		id: string;
		creator: {
			id: string;
			name: string;
		};
		created_at: string;
		title: string;
		images: string[] | null;
		description: string | null;
		category: number;
		price: number | null;
		price_fixed: boolean | null;
	};
};

type OfferReport = {
	id: number;
	created_at: string;
	offer: {
		id: string;
		creator: { id: string; name: string; blocked?: true };
		title: string;
		images: string[] | null;
	};
	type: number;
	description: string | null;
};

type ChatReport = {
	id: number;
	chat: {
		id: number;
		user: { id: string; name: string };
		offer: {
			id: string;
			creator: { id: string; name: string };
			title: string;
		};
		messages: {
			receiver: string;
			created_at: string;
			message: string | null;
			images: string[] | null;
		}[];
	};
	type: number;
	description: string | null;
};

export async function load({ parent, url, depends }) {
	depends('profile:data');

	const { supabase, user } = await parent();

	if (!user) return { offerCount: null, bookmarks: null };

	const { count: offerCount, error: countError } = await supabase
		.from('offers')
		.select('*', { count: 'exact', head: true })
		.eq('creator', user.id);

	if (countError) throw error(500, countError);

	if (url.searchParams.has('offer-reports')) {
		const { data: offerReports, error: offerReportsError } = await supabase
			.from('offer_reports')
			.select('id, created_at, offer(id, creator(id, name), title, images), type, description')
			.eq('reporter', user.id)
			.returns<OfferReport[]>();

		if (offerReportsError) throw error(500, offerReportsError);

		return { offerCount: offerCount as number, offerReports };
	} else if (url.searchParams.has('chat-reports')) {
		const { data: chatReports, error: chatReportsError } = await supabase
			.from('chat_reports')
			.select(
				'id, chat:my_chats(id, user(id, name), offer(id, creator(id, name), title), messages(receiver, created_at, message, images)), type, description'
			)
			.eq('reporter', user.id)
			.order('created_at', { foreignTable: 'chat.messages', ascending: false })
			.limit(3, { foreignTable: 'chat.messages' })
			.returns<ChatReport[]>();

		if (chatReportsError) throw error(500, chatReportsError);

		return { offerCount: offerCount as number, chatReports };
	} else {
		const { data: bookmarks, error: bookmarksError } = await supabase
			.from('bookmarks')
			.select('offer(id, creator(id, name), created_at, title, images, description, category, price, price_fixed)')
			.returns<Bookmark[]>();

		if (bookmarksError) throw error(500, bookmarksError);

		return { offerCount: offerCount as number, bookmarks };
	}
}
