import { Request } from 'express';

export const getPasscodeSendAgainTimer = (req: Request): number => {
	// if we're running in cypress, we want to use the cypress mock state cookie to set the timer for testing
	const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';
	if (runningInCypress) {
		const cypressMockStateCookie = req.cookies['cypress-mock-state'];

		if (cypressMockStateCookie && !isNaN(+cypressMockStateCookie)) {
			return +cypressMockStateCookie;
		}
	}

	return 30; // 30 seconds
};
