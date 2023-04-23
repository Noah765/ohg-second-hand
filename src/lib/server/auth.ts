import { dev } from '$app/environment';
import db from './db';
import prisma from '@lucia-auth/adapter-prisma';
import { idToken } from '@lucia-auth/tokens';
import lucia from 'lucia-auth';
import { sveltekit } from 'lucia-auth/middleware';

const auth = lucia({
	adapter: prisma(db),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	transformDatabaseUser: (userData) => ({
		id: userData.id,
		name: userData.name,
		email: userData.email,
		emailVerified: userData.email_verified
	})
});

export default auth;
export type Auth = typeof auth;

export const emailVerificationToken = idToken(auth, 'email-verification', { expiresIn: 3600 });
export const passwordResetToken = idToken(auth, 'password-reset', { expiresIn: 3600 });
