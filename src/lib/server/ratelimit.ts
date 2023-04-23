import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from '$env/static/private';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });

const emailRatelimit = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(495, '1d') });
const userEmailRatelimit = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(1, '1m') });

export async function checkEmailRateLimit(ip: string) {
	const userResult = await userEmailRatelimit.limit(ip);
	if (!userResult.success) {
		const timeRemaining = Math.floor((userResult.reset - new Date().getTime()) / 1000);
		return { userLimit: timeRemaining };
	}

	const result = await emailRatelimit.limit('');
	if (!result.success) return { emailLimit: true };
}
