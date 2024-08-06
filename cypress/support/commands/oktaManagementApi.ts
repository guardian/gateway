import type { AppResponse } from '../../../src/server/models/okta/App';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			oktaGetApps: typeof oktaGetApps;
		}
	}
}

export const oktaGetApps = (label?: string) => {
	try {
		return cy
			.request({
				url: `${Cypress.env('OKTA_ORG_URL')}/api/v1/apps${label ? `?q=${label}` : ''}`,
				method: 'GET',
				headers: {
					Authorization: `SSWS ${Cypress.env('OKTA_API_TOKEN')}`,
				},
				retryOnStatusCodeFailure: true,
			})
			.then((res) => {
				const user = res.body as AppResponse[];
				return cy.wrap(user);
			});
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands -- try to append, worst case our error will contain a `[object Object]` string.
		throw new Error('Failed to lost okta apps: ' + error);
	}
};
