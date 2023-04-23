import auth, { passwordResetToken } from '$lib/server/auth';
import db from '$lib/server/db';
import { checkEmailRateLimit } from '$lib/server/ratelimit.js';
import schema from '$lib/server/schema';
import sendMail from '$lib/server/sendMail';
import { LuciaTokenError, type Token } from '@lucia-auth/tokens';
import { fail, redirect, type ActionFailure } from '@sveltejs/kit';
import type { Key } from 'lucia-auth';

// export async function load() {
// 	// Select 10 random offers using prisma
// 	// const offers = await db.$queryRaw`SELECT * FROM offer ORDER BY RANDOM() LIMIT 10`
// 	// const offers = await db.offer.findMany({})
// 	// const { user } = await locals.auth.validateUser();
// 	// return { user };
// }

const loginSchema = schema.form({
	name: schema.string().min(3),
	password: schema.string({ name: 'Passwort' }).min(6)
});
const nameSchema = schema.form({ name: schema.string().min(3) });
const emailSchema = schema.form({ email: schema.string().email() });
const passwordSchema = schema.form({ password: schema.string({ name: 'Passwort' }).min(6) });

export const actions = {
	async login({ request, locals }) {
		const result = await schema.check({
			request,
			schema: loginSchema,
			errorNames: { error: 'loginError' },
			errorExclude: ['password']
		});
		if (result.error) return result.error;
		const { name, password } = result.data;

		let key: Key;
		try {
			key = await auth.useKey('name', name, password);
		} catch {
			return fail(400, { loginError: 'Ungültige Zugangsdaten', data: { name } });
		}

		const user = await auth.getUser(key.userId);

		if (!user.emailVerified) throw redirect(303, `/register?verification=${user.email}`);

		const session = await auth.createSession(key.userId);
		locals.auth.setSession(session);
	},
	async logout({ locals }) {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		await auth.invalidateSession(session.sessionId);
		locals.auth.setSession(null);
	},
	async resetPasswordSendEmail({
		request,
		getClientAddress
	}): Promise<ActionFailure<{ resetPasswordError: string; data?: { name?: FormDataEntryValue } }> | undefined> {
		const result = await schema.check({ request, schema: nameSchema, errorNames: { error: 'resetPasswordError' } });
		if (result.error) return result.error;
		const { name } = result.data;

		const user = await db.authUser.findFirst({
			where: { name, email_verified: true },
			select: { id: true, email: true }
		});
		if (!user) return fail(403, { resetPasswordError: 'Verifiziertes Konto nicht gefunden', data: { name } });

		const ratelimit = await checkEmailRateLimit(getClientAddress());
		if (ratelimit?.userLimit) {
			return fail(429, {
				resetPasswordError: `Zu viele Anfragen. Versuche es in ${ratelimit.userLimit} ${
					ratelimit.userLimit === 1 ? 'Sekunde' : 'Sekunden'
				} erneut`
			});
		} else if (ratelimit?.emailLimit) {
			return fail(429, {
				resetPasswordError: 'Das tägliche E-Mail Limit ist für heute ausgeschöpft. Bitte versuche es morgen noch einmal'
			});
		}

		const token = await passwordResetToken.issue(user.id);
		const url = `http://localhost:5173?passwordResetToken=${token}`; // TODO: Update URL

		const emailResult = await sendMail({
			email: user.email,
			subject: 'Passwort zurücksetzen - OHG Second Hand',
			text: `Klicke hier, um dein Passwort zurückzusetzen: ${url}`
		});

		if (emailResult === 'error') {
			return fail(500, { resetPasswordError: 'Fehler beim Versenden der E-Mail', data: { name } });
		}
	},
	async resetPasswordSubmit({
		request,
		locals,
		url
	}): Promise<ActionFailure<{ resetPasswordError: string; data?: { name?: FormDataEntryValue } }> | undefined> {
		const result = await schema.check({
			request,
			schema: passwordSchema,
			errorNames: { error: 'resetPasswordError' },
			errorExclude: ['password']
		});
		if (result.error) return result.error;
		const { password } = result.data;

		const tokenParam = url.searchParams.get('token');
		if (!tokenParam) return fail(400, { resetPasswordError: 'Token zum Zurücksetzen des Passworts wird benötigt' });

		let token: Token;
		try {
			token = await passwordResetToken.validate(tokenParam);
		} catch (e) {
			if (e instanceof LuciaTokenError && e.message === 'EXPIRED_TOKEN') {
				return fail(401, { resetPasswordError: 'Das Token zum Zurücksetzen des Passworts ist abgelaufen' });
			}
			if (e instanceof LuciaTokenError && e.message === 'INVALID_TOKEN') {
				return fail(401, { resetPasswordError: 'Das Token zum Zurücksetzen des Passworts ist ungültig' });
			}
			return fail(500, { resetPasswordError: 'Interner Serverfehler' });
		}

		const user = await db.authUser.findUniqueOrThrow({ where: { id: token.userId }, select: { name: true } });

		await auth.updateKeyPassword('name', user.name, password);
		await auth.invalidateAllUserSessions(token.userId);

		const session = await auth.createSession(token.userId);
		locals.auth.setSession(session);

		throw redirect(303, '/');
	},
	async forgotName({
		request,
		getClientAddress
	}): Promise<
		| ActionFailure<{ forgotNameError: string; forgotNameData?: { email?: FormDataEntryValue } }>
		| { forgotNameData: { email: string } }
	> {
		const result = await schema.check({ request, schema: emailSchema, errorNames: 'forgotName' });
		if (result.error) return result.error;
		const { email } = result.data;

		const user = await db.authUser.findFirst({ where: { email }, select: { name: true } });
		if (!user) return fail(403, { forgotNameError: 'Konto nicht gefunden', forgotNameData: { email } });

		const ratelimit = await checkEmailRateLimit(getClientAddress());
		if (ratelimit?.userLimit) {
			return fail(429, {
				forgotNameError: `Zu viele Anfragen. Versuche es in ${ratelimit.userLimit} ${
					ratelimit.userLimit === 1 ? 'Sekunde' : 'Sekunden'
				} erneut`
			});
		} else if (ratelimit?.emailLimit) {
			return fail(429, {
				forgotNameError: 'Das tägliche E-Mail Limit ist für heute ausgeschöpft. Bitte versuche es morgen noch einmal'
			});
		}

		const emailResult = await sendMail({
			email,
			subject: 'Nutzername vergessen - OHG Second Hand',
			text: `Dein Nutzername ist "${user.name}"`
		});

		if (emailResult === 'error') {
			return fail(500, { forgotNameError: 'Fehler beim Versenden der E-Mail', forgotNameData: { email } });
		}

		return { forgotNameData: { email } };
	}
};
