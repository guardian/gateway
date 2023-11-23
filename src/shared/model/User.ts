import { z } from 'zod';
import { RegistrationLocation } from '@/server/models/okta/User';

export const userConsentSchema = z.object({
	id: z.string(),
	consented: z.boolean().optional(),
});
export type UserConsent = z.infer<typeof userConsentSchema>;

export default interface User {
	consents: UserConsent[];
	primaryEmailAddress: string;
	statusFields: UserStatusFields;
	privateFields: PrivateFields;
	userGroups: Group[];
}

interface Group {
	path: string;
	packageCode: string;
	joinedDate: string;
}

interface UserStatusFields {
	userEmailValidated: boolean;
}

interface PrivateFields {
	firstName?: string;
	secondName?: string;
	registrationLocation?: RegistrationLocation;
}
