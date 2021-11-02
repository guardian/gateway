declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mockNext: typeof mockNext;
    }
  }
}

/**
 * Tell the mock server to return the specified response for the next request.
 * @param status HTTP Status Code
 * @param body Mocked Request Body
 */
export const mockNext = (status: number, body = {}) => {
  const getMockOptions = (status: number, body: object) => ({
    headers: {
      'Content-Type': 'application/json',
      'x-status': status,
    },
    method: 'POST',
    body: JSON.stringify(body),
    url: Cypress.env('mockingEndpoint'),
  });

  cy.request(getMockOptions(status, body));
};
