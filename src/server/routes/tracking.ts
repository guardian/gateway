import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '../models/Express';
import { Request } from 'express';
import { OphanEvent } from '@/shared/model/ophan';
import { record } from '../lib/ophan';
import { readEncryptedStateCookie } from '../lib/encryptedStateCookie';

const USER_TYPES = {
	SIGNIN: 'SIGNIN',
	REGISTER: 'REGISTER',
} as const;

const isValidFormType = (value: string): boolean => {
	return value === USER_TYPES.SIGNIN || value === USER_TYPES.REGISTER;
};

router.post(
	'/tracking/anonymous/form-interaction',
	(req: Request, res: ResponseWithRequestState) => {
		const { anonymisedComponent, anonymisedValue, pageViewId } = req.body;
		const signInOrRegister = readEncryptedStateCookie(req)?.signInOrRegister;

		if (!signInOrRegister || !isValidFormType(signInOrRegister)) {
			return res.status(400).json({ error: 'Unable to determine user type' });
		}

		const component =
			signInOrRegister === USER_TYPES.SIGNIN ? 'sign-in' : 'register';

		const event: OphanEvent = {
			component: `${component}-${anonymisedComponent}`,
			value: anonymisedValue,
		};

		const config = {
			viewId: pageViewId,
		};
		record(event, config);

		return res.status(200).send();
	},
);

export default router;
