import { RegistrationLocation } from '@/shared/model/RegistrationLocation';
import { UserConsent } from '@/shared/model/UserConsents';

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
