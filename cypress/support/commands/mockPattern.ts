declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mockPattern: typeof mockPattern;
    }
  }
}

/**
 * Mock all requests that match the given pattern.
 * @param status HTTP status code to return
 * @param body Mocked Request Body
 * @param pattern Pattern to match against
 */
export const mockPattern = (status: number, body = {}, pattern = '') => {
  const getMockOptions = (status: number, body: object) => {
    const payload = {
      body,
      pattern,
      status,
    };
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-status': status,
      },
      method: 'POST',
      body: JSON.stringify(payload),
      url: Cypress.env('mockingEndpoint') + '/permanent-pattern',
    };
  };

  return cy.request(getMockOptions(status, body));
};
