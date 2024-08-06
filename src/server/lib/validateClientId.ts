import type { ValidClientId } from '@/shared/lib/clientId';
import { validClientId } from '@/shared/lib/clientId';

export const validateClientId = (
	clientId?: string,
): ValidClientId | undefined => validClientId.find((id) => id === clientId);
