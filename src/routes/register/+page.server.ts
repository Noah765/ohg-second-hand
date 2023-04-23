import auth, { emailVerificationToken } from '$lib/server/auth';
import db from '$lib/server/db';
import { checkEmailRateLimit } from '$lib/server/ratelimit';
import schema from '$lib/server/schema';
import sendMail from '$lib/server/sendMail';
import { LuciaTokenError, type Token } from '@lucia-auth/tokens';
import { fail, redirect, type ActionFailure } from '@sveltejs/kit';

export async function load({ parent, locals, url }) {
	const { session } = await parent();
	if (session) throw redirect(303, '/');

	const tokenParam = url.searchParams.get('token');
	if (tokenParam) {
		return await handleVerificationToken(tokenParam, locals);
	}
}

const registerSchema = schema.form({
	name: schema.string().min(3),
	email: schema.string().email(),
	password: schema.string({ name: 'Passwort' }).min(6)
});
const emailSchema = schema.form({ email: schema.string().email() });

export const actions = {
	async register({
		request,
		getClientAddress
	}): Promise<
		ActionFailure<{ registerError: string; registerData?: { name?: FormDataEntryValue; email?: FormDataEntryValue } }>
	> {
		const result = await schema.check({
			request,
			schema: registerSchema,
			errorNames: 'register',
			errorExclude: ['password']
		});
		if (result.error) return result.error;
		const { name, email, password } = result.data;

		const otherUser = await db.authUser.findFirst({
			where: { OR: [{ name }, { email }] },
			select: { name: true, email: true }
		});

		if (otherUser) {
			if (name === otherUser.name) {
				return fail(409, { registerError: 'Der Name ist bereits vergeben', registerData: { name, email } });
			}
			if (email === otherUser.email) {
				return fail(409, { registerError: 'Die E-Mail-Adresse wird bereits für ein anderes Konto verwendet' });
			}
		}

		const ratelimit = await checkEmailRateLimit(getClientAddress());
		if (ratelimit?.userLimit) {
			return fail(429, {
				registerError: `Zu viele Anfragen. Versuche es in ${ratelimit.userLimit} ${
					ratelimit.userLimit === 1 ? 'Sekunde' : 'Sekunden'
				} erneut`
			});
		} else if (ratelimit?.emailLimit) {
			return fail(429, {
				registerError: 'Das tägliche E-Mail Limit ist für heute ausgeschöpft. Bitte versuche es morgen noch einmal'
			});
		}

		const user = await auth.createUser({
			primaryKey: { providerId: 'name', providerUserId: name, password },
			attributes: { name, email, email_verified: false }
		});
		const id = user.id;

		const verificationToken = await emailVerificationToken.issue(id);
		const url = `http://localhost:5173/register?token=${verificationToken}`; // TODO: Update URL

		const verificationResult = await sendMail({
			email: email,
			subject: 'Verifizierungs-E-Mail - OHG Second Hand',
			text: `Klicke hier, um deine E-Mail-Adresse zu verifizieren: ${url}`
		});

		if (verificationResult === 'error') {
			return fail(500, {
				registerError: 'Fehler beim Versenden der Verifizierungs-E-Mail',
				registerData: { name, email }
			});
		}

		throw redirect(303, `?verification=${email}`);
	},
	async resendVerificationEmail({
		request,
		getClientAddress
	}): Promise<ActionFailure<{ modalError: string; modalData?: { email?: FormDataEntryValue } }> | undefined> {
		const result = await schema.check({ request, schema: emailSchema, errorNames: 'modal' });
		if (result.error) return result.error;
		const { email } = result.data;

		const user = await db.authUser.findFirst({
			where: { email, email_verified: false },
			select: { id: true, email: true }
		});
		if (!user) return fail(403, { modalError: 'Unverifiziertes Konto nicht gefunden', modalData: { email } });

		const ratelimit = await checkEmailRateLimit(getClientAddress());
		if (ratelimit?.userLimit) {
			return fail(429, {
				modalError: `Zu viele Anfragen. Versuche es in ${ratelimit.userLimit} ${
					ratelimit.userLimit === 1 ? 'Sekunde' : 'Sekunden'
				} erneut`
			});
		} else if (ratelimit?.emailLimit) {
			return fail(429, {
				modalError: 'Das tägliche E-Mail Limit ist für heute ausgeschöpft. Bitte versuche es morgen noch einmal'
			});
		}

		const verificationToken = await emailVerificationToken.issue(user.id);
		const url = `http://localhost:5173/register?token=${verificationToken}`; // TODO: Update URL

		const verificationResult = await sendMail({
			email: user.email,
			subject: 'Verifizierungs-E-Mail - OHG Second Hand',
			text: `Klicke hier, um deine E-Mail-Adresse zu verifizieren: ${url}`
		});

		if (verificationResult === 'error') {
			return fail(500, { modalError: 'Fehler beim Versenden der Verifizierungs-E-Mail', modalData: { email } });
		}
	},
	async cancelRegistration({ request }) {
		const schemaResult = await schema.check({ request, schema: emailSchema, errorNames: 'modal' });
		if (schemaResult.error) throw redirect(303, '/register');
		const { email } = schemaResult.data;

		await db.authUser.deleteMany({ where: { email, email_verified: false } });

		throw redirect(303, '/register');
	}
};

async function handleVerificationToken(tokenParam: string, locals: App.Locals) {
	let token: Token;
	try {
		token = await emailVerificationToken.validate(tokenParam);
	} catch (e) {
		if (e instanceof LuciaTokenError) return { error: e.message };
		return { error: 'Interner Serverfehler' };
	}

	await auth.updateUserAttributes(token.userId, { email_verified: true });

	const session = await auth.createSession(token.userId);
	locals.auth.setSession(session);

	throw redirect(303, '/');
}
