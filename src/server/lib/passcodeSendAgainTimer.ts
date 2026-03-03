import { Request } from 'express';

export const getPasscodeSendAgainTimer = (req: Request): number => {
	// if we're running in playwright, we want to use the playwright mock state cookie to set the timer for testing
	const runningInPlaywright = process.env.RUNNING_IN_PLAYWRIGHT === 'true';
	if (runningInPlaywright) {
		const playwrightMockStateCookie = req.cookies['playwright-mock-state'];

		if (playwrightMockStateCookie && !isNaN(+playwrightMockStateCookie)) {
			return +playwrightMockStateCookie;
		}
	}

	return 30; // 30 seconds
};
