import { Request } from 'express';
import { decrypt, encrypt } from './crypto';
import { getConfiguration } from './getConfiguration';
import { base64ToUrlSafeString, urlSafeStringToBase64 } from './base64';
import { logger } from './serverSideLogger';
import {
	RegistrationConsents,
	registrationConsentsSchema,
} from '@/shared/model/RegistrationConsents';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import {
	RegistrationNewslettersFormFieldsMap,
	newsletterBundleToIndividualNewsletters,
} from '@/shared/model/Newsletter';

// consents/newsletters are a string with value `'on'` if checked, or `undefined` if not checked
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value
// so we can check the truthiness of the value to determine if the user has consented
// and we filter out any consents that are not consented
export const bodyFormFieldsToRegistrationConsents = (
	body: Request['body'],
): RegistrationConsents => ({
	consents: Object.values(RegistrationConsentsFormFields)
		.map((field) => ({
			id: field.id,
			consented: !!body[field.id],
		}))
		.filter((newsletter) => newsletter.consented),
	newsletters: Object.values(RegistrationNewslettersFormFieldsMap)
		.map((field) => ({
			id: field.id,
			subscribed: !!body[field.id],
		}))
		// Registration newsletter consents might be a 'bundle' of consents, which have
		// specific IDs. We need to replace the bundle consent with a list of the individual
		// consents that are part of the bundle.
		.flatMap((newsletter) => {
			// First, filter out all those newsletters which are not being subscribed to
			if (!newsletter.subscribed) {
				return [];
			}
			switch (newsletter.id) {
				case 'auBundle':
				case 'usBundle':
					return newsletterBundleToIndividualNewsletters(newsletter.id).map(
						(id) => ({
							id,
							subscribed: true,
						}),
					);
				default:
					return [newsletter];
			}
		}),
});

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
