import { supabaseAdmin as supabase } from '$lib/server/supabase.js';
import { error } from '@sveltejs/kit';

type AdminReportRequest = {
	deleteOfferReport?: number;
	deleteChatReport?: number;
	deleteAllReportsOffer?: string;
	deleteAllReportsChat?: string;
	deleteAllOfferReportsAccount?: string;
	deleteAllChatReportsAccount?: string;
	deleteAllOfferReportsReporter?: string;
	deleteAllChatReportsReporter?: string;
	deleteOffer?: string;
	deleteChat?: string;
	deleteAllOffersCreator?: string;
	deleteAllChatsUser?: string;
	blockOtherUser?: { id: string; description: string; duration: number };
	blockReporter?: { id: string; description: string; duration: number };
};

export async function POST({ locals: { getSession }, request }) {
	const session = await getSession();

	if (!session) throw error(401);

	const { data: admin, error: supabaseUserError } = await supabase.rpc('check_admin', { user_id: session.user.id });
	if (supabaseUserError) {
		throw error(500, { message: 'Failed to fetch', details: 'Internal server api failed to fetch the users table' });
	}

	if (!admin) throw error(401);

	const {
		deleteOfferReport,
		deleteChatReport,
		deleteAllReportsOffer,
		deleteAllReportsChat,
		deleteAllOfferReportsAccount,
		deleteAllChatReportsAccount,
		deleteAllOfferReportsReporter,
		deleteAllChatReportsReporter,
		deleteOffer,
		deleteChat,
		deleteAllOffersCreator,
		deleteAllChatsUser,
		blockOtherUser,
		blockReporter
	}: AdminReportRequest = await request.json();

	const promises = [];

	if (deleteOfferReport !== undefined) {
		promises.push(supabase.from('offer_reports').delete().eq('id', deleteOfferReport));
	}
	if (deleteChatReport !== undefined) {
		promises.push(supabase.from('chat_reports').delete().eq('id', deleteChatReport));
	}
	if (deleteAllReportsOffer !== undefined) {
		promises.push(supabase.from('offer_reports').delete().eq('offer', deleteAllReportsOffer));
	}
	if (deleteAllReportsChat !== undefined) {
		promises.push(supabase.from('chat_reports').delete().eq('chat', deleteAllReportsChat));
	}
	async function deleteAllOfferReportsAccountPromise() {
		const { data, error } = await supabase.from('offers').select('id').eq('creator', deleteAllOfferReportsAccount);
		if (error) return { error };

		return supabase
			.from('offer_reports')
			.delete()
			.in(
				'offer',
				data.map((e) => e.id)
			);
	}
	if (deleteAllOfferReportsAccount !== undefined) {
		promises.push(deleteAllOfferReportsAccountPromise());
	}
	if (deleteAllChatReportsAccount !== undefined) {
		promises.push(supabase.rpc('delete_chat_reports_account', { user_id: deleteAllChatReportsAccount }));
	}
	if (deleteAllOfferReportsReporter !== undefined) {
		promises.push(supabase.from('offer_reports').delete().eq('reporter', deleteAllOfferReportsReporter));
	}
	if (deleteAllChatReportsReporter !== undefined) {
		promises.push(supabase.from('chat_reports').delete().eq('reporter', deleteAllChatReportsReporter));
	}
	if (deleteOffer !== undefined) {
		promises.push(supabase.from('offers').delete().eq('id', deleteOffer));
	}
	if (deleteChat !== undefined) {
		promises.push(supabase.from('chats').delete().eq('id', deleteChat));
	}
	if (deleteAllOffersCreator !== undefined) {
		promises.push(supabase.from('offers').delete().eq('creator', deleteAllOffersCreator));
	}
	if (deleteAllChatsUser !== undefined) {
		promises.push(supabase.rpc('delete_chats_user', { user_id: deleteAllChatsUser }));
	}
	if (blockOtherUser !== undefined) {
		const blockedUntil = new Date().valueOf() + blockOtherUser.duration * 3600000;
		promises.push(
			supabase.auth.admin.updateUserById(blockOtherUser.id, {
				ban_duration: `${blockOtherUser.duration}h`,
				user_metadata: { blocked_until: blockedUntil, block_description: blockOtherUser.description }
			})
		);
	}
	if (blockReporter !== undefined) {
		const blockedUntil = new Date(new Date().valueOf() + blockReporter.duration * 3600000);
		promises.push(
			supabase.auth.admin.updateUserById(blockReporter.id, {
				ban_duration: `${blockReporter.duration}h`,
				user_metadata: { blocked_until: blockedUntil, block_description: blockReporter.description }
			})
		);
	}

	const results = await Promise.all(promises);
	for (const result of results) {
		if (result.error !== null) {
			throw error(500, result.error);
		}
	}

	return new Response('success');
}
