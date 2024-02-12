declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			interceptRecaptcha: typeof interceptRecaptcha;
		}
	}
}

/**
 * Simulate an error with recaptcha so we can test the error messaging and user behaviour
 */
export const interceptRecaptcha = (times = 1) => {
	cy.intercept(
		{
			method: 'POST',
			url: 'https://www.google.com/recaptcha/api2/**',
			times,
		},
		{
			statusCode: 500,
		},
	);
};
