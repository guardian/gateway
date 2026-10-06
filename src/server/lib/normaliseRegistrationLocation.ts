import {
	RegistrationLocation,
	RegistrationLocationSchema,
} from '@/shared/model/RegistrationLocation';

export const normaliseRegistrationLocation = (
	registrationLocation: RegistrationLocation,
): RegistrationLocation | undefined => {
	const normalised = registrationLocation
		.replace(/[\u2010-\u2015\u2212]/g, '-') // normalize unicode dashes to ASCII
		.replace(/^[\s\-–—•*.,;:]+|[\s\-–—•*.,;:]+$/g, '') // strip leading/trailing punctuation + whitespace
		.replace(/\s+/g, ' '); // collapse inner whitespace

	const result = RegistrationLocationSchema.safeParse(normalised);
	return result.success ? result.data : undefined;
};
