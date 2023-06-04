import { supabaseAdmin } from '$lib/server/supabase.js';
import { error, redirect } from '@sveltejs/kit';

type OfferReport = {
	id: number;
	created_at: string;
	offer: {
		id: string;
		creator: { id: string; name: string; blocked?: true };
		title: string;
		images: string[] | null;
	};
	reporter: { id: string; name: string; blocked?: true };
	type: number;
	description: string | null;
};

type ChatReport = {
	id: number;
	created_at: string;
	chat: {
		id: number;
		user: { id: string; name: string; blocked?: true };
		offer: {
			id: string;
			creator: { id: string; name: string; blocked?: true };
			title: string;
		};
		messages: {
			receiver: string;
			created_at: string;
			message: string | null;
			images: string[] | null;
		}[];
	};
	reporter: string;
	type: number;
	description: string | null;
};

export async function load({ locals: { getSession, supabase }, url, depends }) {
	depends('reports:data');

	const session = await getSession();

	if (!session) throw redirect(303, '/');

	const { data: admin, error: supabaseUserError } = await supabaseAdmin.rpc('check_admin', {
		user_id: session.user.id
	});
	if (supabaseUserError) throw error(500, supabaseUserError);

	if (!admin) throw redirect(303, '/');

	const page = getPage(url.searchParams.get('page'));

	let chatReports: ChatReport[] | null = null;
	let offerReports: OfferReport[] | null = null;
	let reportsCount: number;

	if (url.searchParams.has('chat-reports')) {
		const {
			data,
			count,
			error: supabaseError
		} = await supabase
			.from('chat_reports')
			.select(
				'id, created_at, chat:chats(id, user(id, name), offer(id, creator(id, name), title), messages(receiver, created_at, message, images)), reporter, type, description',
				{ count: 'exact' }
			)
			.order('created_at', { foreignTable: 'chats.messages', ascending: false })
			.limit(3, { foreignTable: 'chats.messages' })
			.range(page ? page[0] : 0, page ? page[1] : 9)
			.returns<ChatReport[]>();

		if (supabaseError) throw error(500, supabaseError);

		chatReports = data;
		reportsCount = count as number;
	} else {
		const {
			data,
			count,
			error: supabaseError
		} = await supabaseAdmin
			.from('offer_reports')
			.select('id, created_at, offer(id, creator(id, name), title, images), reporter(id, name), type, description', {
				count: 'exact'
			})
			.range(page ? page[0] : 0, page ? page[1] : 9)
			.returns<OfferReport[]>();

		if (supabaseError) throw error(500, supabaseError);

		offerReports = data;
		reportsCount = count as number;
	}

	const usersBlocked: { id: string; blocked: boolean }[] = [];
	for (const report of chatReports === null ? (offerReports as OfferReport[]) : chatReports) {
		const offerCreator =
			chatReports === null ? (report as OfferReport).offer.creator.id : (report as ChatReport).chat.offer.creator.id;
		const offerCreatorBlocked = usersBlocked.find((user) => user.id === offerCreator);

		if (offerCreatorBlocked !== undefined && offerCreatorBlocked.blocked) {
			if (chatReports === null) {
				(report as OfferReport).offer.creator.blocked = true;
			} else {
				(report as ChatReport).chat.offer.creator.blocked = true;
			}
		} else if (offerCreatorBlocked === undefined) {
			const { data: offerCreatorBlocked, error: offerCreatorBlockedError } = await supabase.rpc('is_blocked', {
				user_id: offerCreator
			});
			if (offerCreatorBlockedError) throw error(500, offerCreatorBlockedError);

			usersBlocked.push({ id: offerCreator, blocked: offerCreatorBlocked });

			if (offerCreatorBlocked && chatReports === null) {
				(report as OfferReport).offer.creator.blocked = true;
			} else if (offerCreatorBlocked) {
				(report as ChatReport).chat.offer.creator.blocked = true;
			}
		}

		const otherUser = chatReports === null ? (report as OfferReport).reporter.id : (report as ChatReport).chat.user.id;
		const otherUserBlocked = usersBlocked.find((user) => user.id === otherUser);

		if (otherUserBlocked !== undefined && otherUserBlocked.blocked) {
			if (chatReports === null) {
				(report as OfferReport).reporter.blocked = true;
			} else {
				(report as ChatReport).chat.user.blocked = true;
			}
		} else if (otherUserBlocked === undefined) {
			const { data: otherUserBlocked, error: otherUserBlockedError } = await supabase.rpc('is_blocked', {
				user_id: otherUser
			});
			if (otherUserBlockedError) throw error(500, otherUserBlockedError);

			usersBlocked.push({ id: otherUser, blocked: otherUserBlocked });

			if (otherUserBlocked && chatReports === null) {
				(report as OfferReport).reporter.blocked = true;
			} else if (otherUserBlocked) {
				(report as ChatReport).chat.user.blocked = true;
			}
		}
	}

	return { offerReports: offerReports, chatReports: chatReports, offerReportsCount: reportsCount as number };
}

function getPage(page: string | null): [number, number] | undefined {
	if (!page) return;

	const number = parseInt(page);
	if (isNaN(number) || number < 1) return;
	return [(number - 1) * 10, number * 10 - 1];
}
