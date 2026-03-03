import { BrowserContext } from '@playwright/test';
import { encrypt } from '@/server/lib/crypto';
import { EncryptedState } from '@/shared/model/EncryptedState';

const DOMAIN = 'profile.thegulocal.com';

/**
 * Set the mvtId cookie
 * @param context Browser context
 * @param value Value to set the mvtId cookie to
 */
export async function setMvtId(
	context: BrowserContext,
	value: string,
): Promise<void> {
	await context.addCookies([
		{
			name: 'GU_mvt_id',
			value,
			domain: DOMAIN,
			path: '/',
		},
	]);
}

/**
 * Set the GU_AF1 cookie dropped by Support-Frontend if a user has purchased a digital subscription.
 * Default expiry is Now + 1 day in millis
 * https://github.com/guardian/support-frontend/blob/728ff9fb6ef1e955d9b878c56a59392426f65db8/support-frontend/app/controllers/CreateSubscriptionController.scala#L156
 * @param context Browser context
 * @param expiryInDays when the cookie should expire (can also be in the past eg. -1)
 */
export async function setAdFreeCookie(
	context: BrowserContext,
	expiryInDays = 1,
): Promise<void> {
	const tz = Date.now() + 1000 * 60 * 60 * 24 * expiryInDays;
	await context.addCookies([
		{
			name: 'GU_AF1',
			value: tz.toString(),
			domain: DOMAIN,
			path: '/',
		},
	]);
}

/**
 * Set the encrypted state cookie
 * @param context Browser context
 * @param state Encrypted state object
 */
export async function setEncryptedStateCookie(
	context: BrowserContext,
	state: EncryptedState,
): Promise<void> {
	const encrypted = encrypt(
		JSON.stringify(state),
		process.env.ENCRYPTION_SECRET_KEY || '',
	);
	await context.addCookies([
		{
			name: 'GU_GATEWAY_STATE',
			value: encrypted,
			domain: DOMAIN,
			path: '/',
		},
	]);
}
