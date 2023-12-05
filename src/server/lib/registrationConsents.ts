import { decrypt, encrypt } from './crypto';
import { getConfiguration } from './getConfiguration';
import { base64ToUrlSafeString, urlSafeStringToBase64 } from './base64';
import { logger } from './serverSideLogger';
import {
	RegistrationConsents,
	registrationConsentsSchema,
} from '@/shared/model/RegistrationConsents';

// convert the registration consents into a string that has the following format:
// consent1=true,consent2=false|newsletter1=true,newsletter2=false
export const minifyRegistrationConsents = (
	registrationConsents: RegistrationConsents,
): string => {
	const consents =
		registrationConsents.consents
			?.map((consent) => `${consent.id}=${consent.consented}`)
			.join(',') || '';

	const newsletters =
		registrationConsents.newsletters
			?.map((newsletter) => `${newsletter.id}=${newsletter.subscribed}`)
			.join(',') || '';

	return [consents, newsletters].join('|');
};

// convert the minified registration consents string back into the RegistrationConsents object
// see minifyRegistrationConsents for the format of the string
export const expandRegistrationConsents = (
	minifiedConsents: string,
): RegistrationConsents => {
	const [consents, newsletters] = minifiedConsents.split('|');

	const consentArray = consents.includes('=')
		? consents.split(',').map((consent) => {
				const [id, consented] = consent.split('=');
				return { id, consented: consented === 'true' };
		  })
		: [];

	const newsletterArray = newsletters.includes('=')
		? newsletters.split(',').map((newsletter) => {
				const [id, subscribed] = newsletter.split('=');
				return { id, subscribed: subscribed === 'true' };
		  })
		: [];

	return {
		consents: consentArray,
		newsletters: newsletterArray,
	};
};

// Encode the registration consents payload into an encrypted base64 string
// This is sent through as a URL segment in the 'verify email address' email
// sent to the user to ensure this state is not lost if moving between devices.
export const encryptRegistrationConsents = (
	registrationConsents: RegistrationConsents,
): string => {
	const encryptedConsents = encrypt(
		minifyRegistrationConsents(registrationConsents),
		getConfiguration().encryptionSecretKey, // prevent the key from lingering in memory by only calling when needed
	);

	return base64ToUrlSafeString(encryptedConsents);
};

export const decryptRegistrationConsents = (
	encryptedConsents: string,
): RegistrationConsents | undefined => {
	try {
		const decoded = urlSafeStringToBase64(encryptedConsents);

		const decrypted = decrypt(
			decoded,
			getConfiguration().encryptionSecretKey, // prevent the key from lingering in memory by only calling when needed
		);

		return registrationConsentsSchema.parse(
			expandRegistrationConsents(decrypted),
		);
	} catch (error) {
		logger.warn('Could not decrypt registration consents', error);
	}
};
