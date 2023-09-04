import { EMAIL_PASSWORD, SUPABASE_MESSAGES_EMAIL_KEY } from '$env/static/private';
import { PUBLIC_EMAIL_ADDRESS, PUBLIC_SITE_URL } from '$env/static/public';
import { formatImage, formatTime } from '$lib/format.js';
import { error } from '@sveltejs/kit';
import { createTransport } from 'nodemailer';

type Body = {
	name: string;
	email: string;
	chats: {
		id: number;
		offer_title: string;
		offer_creator: string;
		chat_user: string;
		messages: { created_at: string; message: string; images: string[] | null }[];
	}[];
}[];

const transporter = createTransport({
	host: 'ohg-monheim.eu',
	port: 587,
	auth: { user: 'secondhand.ag', pass: EMAIL_PASSWORD }
});

export async function POST({ request }) {
	if (request.headers.get('Authorization') !== SUPABASE_MESSAGES_EMAIL_KEY) throw error(401);
	const body = (await request.json()) as Body;

	for (const { name, email, chats } of body) {
		const chatCount = chats.length;
		const messageCount = chats.reduce((previous, e) => previous + e.messages.length, 0);

		let subject: string;
		if (messageCount === 1) subject = 'Eine neue Chatnachricht';
		else if (chatCount === 1) subject = `${messageCount} neue Chatnachrichten`;
		else subject = `${messageCount} neue Nachrichten aus ${chatCount} Chats`;

		let content: string;
		if (messageCount === 1) {
			const chat = chats[0];
			const message = chat.messages[0];
			const otherUser = name === chat.offer_creator ? chat.chat_user : chat.offer_creator;

			content = `Hallo ${name},<br><br>du hast eine neue Nachricht von ${otherUser} zum Angebot ${
				chat.offer_title
			} erhalten (<a href="${PUBLIC_SITE_URL}/chat/${chat.id}">zum Chat</a>):<br><br>----- (${formatTime(
				message.created_at
			)})<br><br>${message.message}`;

			if (message.images !== null) {
				for (const image of message.images) {
					content += `<br><img src="${formatImage(image, 'message_images')}">`;
				}
			}

			content += '<br><br>-----';
		} else if (chatCount === 1) {
			const chat = chats[0];
			const otherUser = name === chat.offer_creator ? chat.chat_user : chat.offer_creator;

			content = `Hallo ${name},<br><br>du hast ${messageCount} neue Nachrichten von ${otherUser} zum Angebot ${chat.offer_title} erhalten (<a href="${PUBLIC_SITE_URL}/chat/${chat.id}">zum Chat</a>):<br><br>-----`;

			for (const message of chat.messages) {
				content += ` (${formatTime(message.created_at)})<br><br>${message.message}`;
				if (message.images !== null) {
					for (const image of message.images) {
						content += `<br><img src="${formatImage(image, 'message_images')}">`;
					}
				}
				content += '<br><br>-----';
			}
		} else {
			content = `Hallo ${name},<br><br>du hast ${messageCount} neue Nachrichten erhalten.`;

			for (const chat of chats) {
				const otherUser = name === chat.offer_creator ? chat.chat_user : chat.offer_creator;
				content += `<br><br><br>Von ${otherUser} zum Angebot ${chat.offer_title} (<a href="${PUBLIC_SITE_URL}/chat/${chat.id}">zum Chat</a>):<br><br>-----`;

				for (const message of chat.messages) {
					content += ` (${formatTime(message.created_at)})<br><br>${message.message}`;
					if (message.images !== null) {
						for (const image of message.images) {
							content += `<br><img src="${formatImage(image, 'message_images')}">`;
						}
					}
					content += '<br><br>-----';
				}
			}
		}

		await transporter.sendMail({
			from: { address: PUBLIC_EMAIL_ADDRESS, name: 'OHG Second Hand' },
			to: email,
			subject,
			html: content
		});
	}

	return new Response('success');
}
