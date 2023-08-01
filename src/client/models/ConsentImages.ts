import { Consents } from '@/shared/model/Consent';

import { EVENTS_IMAGE, SUPPORTER_IMAGE } from '@/client/assets/consents';

export const CONSENT_IMAGES: Record<string, string> = {
	[Consents.EVENTS]: EVENTS_IMAGE,
	[Consents.SUPPORTER]: SUPPORTER_IMAGE,
};
