import {
	RegistrationConsents,
	registrationConsentsSchema,
} from '@/shared/model/Consent';
import { decrypt, encrypt } from './crypto';
import { getConfiguration } from './getConfiguration';
import { base64ToUrlSafeString, urlSafeStringToBase64 } from './base64';
import { logger } from './serverSideLogger';

// Encode the registration consents payload into an encrypted base64 string
// This is sent through as a URL segment in the 'verify email address' email
// sent to the user to ensure this state is not lost if moving between devices.
export const encryptRegistrationConsents = (
	registrationConsents: RegistrationConsents,
): string => {
	const encryptedConsents = encrypt(
		JSON.stringify(registrationConsents),
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

		return registrationConsentsSchema.parse(JSON.parse(decrypted));
	} catch (error) {
		logger.warn('Could not decrypt registration consents', error);
	}
};
