import { getRegistrationPlatform } from '@/server/lib/registrationPlatform';
import { getAppName, isAppLabel } from '@/shared/lib/appNameUtils';

export const getAppNameFromRegistrationPlatform = async (
	appClientId: string | undefined,
) => {
	const registrationPlatform = await getRegistrationPlatform(appClientId);
	return isAppLabel(registrationPlatform)
		? getAppName(registrationPlatform)
		: undefined;
};
