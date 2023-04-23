import db from '$lib/server/db.js';

export const actions = {
	async default() {
		await db.messages.create({ data: { chat_id: 1, is_creator: false, message: 'TEST Message' } });
		console.log('Messages table inserted');
	}
};
