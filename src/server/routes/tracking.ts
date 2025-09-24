import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { handleAsyncErrors } from '../lib/expressWrappers';
import { ResponseWithRequestState } from '../models/Express';
import { Request } from 'express';
import { getUserType } from '../lib/idapi/user';
import { OphanEvent } from '@/shared/model/ophan';
import { record } from '../lib/ophan';

router.post(
	'/tracking/anonymous/form-interaction',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { anonymisedComponent, anonymisedValue, pageViewId, email } =
			req.body;

		const userType = await getUserType(email);

		if (!userType) {
			return res.status(400).json({ error: 'Unable to determine user type' });
		}

		const event: OphanEvent = {
			component: `${userType}-${anonymisedComponent}`,
			value: anonymisedValue,
		};

		const config = {
			viewId: pageViewId,
		};
		//https://ophan.theguardian.com/img/2?viewId=mfy3i6stqw5kpnghzig7&component=sign-in-form&value=email-input-blur
		record(event, config);

		return res.status(200).send();
	}),
);

export default router;
