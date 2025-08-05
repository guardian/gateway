declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			interceptRecaptcha: typeof interceptRecaptcha;
			failRecaptchaRequest: typeof failRecaptchaRequest;
			reEnableRecaptchaRequest: typeof reEnableRecaptchaRequest;
		}
	}
}

/**
 * Simulate an error with recaptcha so we can test the error messaging and user behaviour
 */
export const interceptRecaptcha = (times: number | 'indefinate' = 1) => {
	cy.intercept(
		{
			method: 'POST',
			url: 'https://www.google.com/recaptcha/api2/**',
			...(typeof times === 'number' && { times }),
		},
		{
			statusCode: 500,
		},
	);
};

export const failRecaptchaRequest = () => {
	cy.intercept(
		{
			method: 'POST',
			url: 'https://www.google.com/recaptcha/api2/**',
		},
		{ statusCode: 500 },
	);
};

export const reEnableRecaptchaRequest = () => {
	cy.intercept(
		{
			method: 'POST',
			url: 'https://www.google.com/recaptcha/api2/**',
		},
		(req) => {
			req.continue();
		},
	);
};
