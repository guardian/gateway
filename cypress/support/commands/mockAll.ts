declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mockAll: typeof mockAll;
    }
  }
}

/**
 * Tell the mock server to mock all requests to a given URL.
 * @param status HTTP status code to return.
 * @param body Mocked response body.
 * @param path URL to mock
 */
export const mockAll = (status: number, body = {}, path = '') => {
  const getMockOptions = (status: number, body: object) => {
    const payload = {
      body,
      path,
      status,
    };
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-status': status,
      },
      method: 'POST',
      body: JSON.stringify(payload),
      url: Cypress.env('mockingEndpoint') + '/permanent',
    };
  };

  return cy.request(getMockOptions(status, body));
};
